import { SandboxAccessCache } from './access';
import { SandboxAccessError, createServerError } from './errors';
import {
  SandboxConnectionOptions,
  SandboxMuxSocket,
  concatBytes,
  createRequestId,
  decodeFrame,
  encodeFrame
} from './socket';

export type SandboxFileType = 'file' | 'directory' | 'symlink' | 'other';

export interface SandboxFileEntry {
  name: string;
  path: string;
  type: SandboxFileType;
  size: number;
  mode: number;
  modifiedAt: Date;
  target?: string;
}

export interface SandboxFileList {
  entries: SandboxFileEntry[];
  truncated: boolean;
}

export interface SandboxListFilesOptions {
  recursive?: boolean;
  maxDepth?: number;
  limit?: number;
}

export interface SandboxReadFileOptions {
  offset?: number;
  length?: number;
}

export interface SandboxWriteFileOptions {
  overwrite?: boolean;
  parents?: boolean;
  mode?: number | string;
}

export type SandboxFileData = string | Uint8Array | ArrayBuffer | Blob;

interface PendingOperation {
  onEntries?: (entries: any[]) => void;
  onData?: (data: Uint8Array) => void;
  resolve: (fields: Record<string, any>) => void;
  reject: (error: SandboxAccessError) => void;
}

let CHUNK_SIZE = 64 * 1024;
let UPLOAD_HIGH_WATER_MARK = 4 * 1024 * 1024;
let DEFAULT_LIST_LIMIT = 10000;
let MAX_ATTEMPTS = 3;
let RESEND_DELAY_MS = 200;

let unsentErrors = new WeakSet<object>();

let textEncoder = new TextEncoder();
let textDecoder = new TextDecoder();

let joinPath = (parent: string, child: string) =>
  `${parent.replace(/\/+$/, '')}/${child.replace(/^\/+/, '')}`;

let baseName = (path: string) => path.replace(/\/+$/, '').split('/').pop() || '/';

let toEntry = (raw: any, parent?: string): SandboxFileEntry => {
  let path: string =
    parent === undefined
      ? raw.path
      : typeof raw.name == 'string'
        ? joinPath(parent, raw.name)
        : joinPath(parent, raw.path);

  return {
    name: typeof raw.name == 'string' ? raw.name : baseName(path),
    path,
    type: raw.type,
    size: Number(raw.size ?? 0),
    mode: Number(raw.mode ?? 0),
    modifiedAt: new Date(Number(raw.mtime ?? 0)),
    ...(typeof raw.target == 'string' && { target: raw.target })
  };
};

let toBytes = async (data: SandboxFileData) => {
  if (typeof data == 'string') return textEncoder.encode(data);
  if (data instanceof Uint8Array) return data;
  if (data instanceof ArrayBuffer) return new Uint8Array(data);
  return new Uint8Array(await data.arrayBuffer());
};

let sha256Hex = async (data: Uint8Array) => {
  let subtle = (globalThis as any).crypto?.subtle;
  if (!subtle) return undefined;

  let digest = new Uint8Array(await subtle.digest('SHA-256', data));
  return Array.from(digest, byte => byte.toString(16).padStart(2, '0')).join('');
};

export class SandboxFiles {
  #socket: SandboxMuxSocket;
  #pending = new Map<string, PendingOperation>();

  constructor(access: SandboxAccessCache, opts: SandboxConnectionOptions = {}) {
    this.#socket = new SandboxMuxSocket({
      access,
      onNotice: opts.onNotice,
      onText: message => this.#handleText(message),
      onBinary: data => {
        let frame = decodeFrame(data);
        if (frame) this.#pending.get(frame.id)?.onData?.(frame.payload);
      },
      onDisconnect: error => {
        for (let operation of [...this.#pending.values()]) operation.reject(error);
      }
    });
  }

  static async connect(access: SandboxAccessCache, opts?: SandboxConnectionOptions) {
    let files = new SandboxFiles(access, opts);
    await files.#socket.ensureOpen();
    return files;
  }

  get isClosed() {
    return this.#socket.isClosed;
  }

  async list(path: string, opts: SandboxListFilesOptions = {}): Promise<SandboxFileList> {
    return this.#withRetry(async () => {
      let entries: SandboxFileEntry[] = [];

      let result = await this.#run(
        'list',
        {
          path,
          limit: opts.limit ?? DEFAULT_LIST_LIMIT,
          ...(opts.recursive && { recursive: true }),
          ...(opts.maxDepth !== undefined && { maxDepth: opts.maxDepth })
        },
        { onEntries: batch => entries.push(...batch.map(raw => toEntry(raw, path))) }
      );

      return { entries, truncated: result.truncated === true };
    });
  }

  async stat(path: string, opts: { followSymlinks?: boolean } = {}) {
    return this.#withRetry(async () => {
      let result = await this.#run('stat', { path, followSymlinks: !!opts.followSymlinks });
      return toEntry(result.entry);
    });
  }

  async exists(path: string) {
    try {
      await this.stat(path);
      return true;
    } catch (error) {
      if (error instanceof SandboxAccessError && error.code == 'not_found') return false;
      throw error;
    }
  }

  async read(path: string, opts: SandboxReadFileOptions = {}) {
    return this.#withRetry(async () => {
      let chunks: Uint8Array[] = [];

      await this.#run(
        'read',
        {
          path,
          ...(opts.offset !== undefined && { offset: opts.offset }),
          ...(opts.length !== undefined && { length: opts.length })
        },
        { onData: chunk => chunks.push(chunk.slice()) }
      );

      return concatBytes(chunks);
    });
  }

  async readText(path: string, opts?: SandboxReadFileOptions) {
    return textDecoder.decode(await this.read(path, opts));
  }

  async write(path: string, data: SandboxFileData, opts: SandboxWriteFileOptions = {}) {
    let bytes = await toBytes(data);
    let checksum = await sha256Hex(bytes);

    return this.#withRetry(async () => {
      let result = await this.#run(
        'write',
        {
          path,
          size: bytes.length,
          overwrite: opts.overwrite ?? true,
          ...(opts.parents && { parents: true }),
          ...(opts.mode !== undefined && { mode: opts.mode })
        },
        {
          upload: async (id, isActive) => {
            for (let offset = 0; offset < bytes.length; offset += CHUNK_SIZE) {
              await this.#socket.waitForDrain(UPLOAD_HIGH_WATER_MARK);
              if (!isActive()) return;

              this.#socket.sendIfOpen(
                encodeFrame(id, bytes.subarray(offset, offset + CHUNK_SIZE))
              );
            }

            if (!isActive()) return;
            this.#socket.sendIfOpen(
              JSON.stringify({ id, type: 'end', ...(checksum && { sha256: checksum }) })
            );
          }
        }
      );

      return { path, size: Number(result.size ?? bytes.length) };
    }, opts.overwrite ?? true);
  }

  async mkdir(path: string, opts: { parents?: boolean; mode?: number | string } = {}) {
    await this.#withRetry(
      () =>
        this.#run('mkdir', {
          path,
          parents: !!opts.parents,
          ...(opts.mode !== undefined && { mode: opts.mode })
        }),
      !!opts.parents
    );
  }

  async move(from: string, to: string, opts: { overwrite?: boolean } = {}) {
    await this.#withRetry(
      () => this.#run('move', { from, to, overwrite: !!opts.overwrite }),
      false
    );
  }

  async delete(path: string, opts: { recursive?: boolean; missingOk?: boolean } = {}) {
    await this.#withRetry(
      () =>
        this.#run('delete', {
          path,
          recursive: !!opts.recursive,
          ...(opts.missingOk && { missingOk: true })
        }),
      !!opts.missingOk
    );
  }

  close() {
    this.#socket.close();
  }

  #handleText(message: Record<string, any>) {
    if (typeof message.id != 'string') return;

    let operation = this.#pending.get(message.id);
    if (!operation) return;

    switch (message.type) {
      case 'entries':
        return operation.onEntries?.(Array.isArray(message.entries) ? message.entries : []);
      case 'result': {
        let { id: _id, type: _type, ...fields } = message;
        return operation.resolve(fields);
      }
      case 'error':
        return operation.reject(createServerError(message.error ?? {}));
    }
  }

  async #withRetry<T>(run: () => Promise<T>, canResend = true) {
    for (let attempt = 1; ; attempt++) {
      try {
        return await run();
      } catch (error) {
        let shouldResend =
          (canResend || unsentErrors.has(error as object)) &&
          attempt < MAX_ATTEMPTS &&
          !this.isClosed &&
          error instanceof SandboxAccessError &&
          error.retryable;

        if (!shouldResend) throw error;

        await new Promise(resolve => setTimeout(resolve, RESEND_DELAY_MS * attempt));
      }
    }
  }

  async #run(
    op: string,
    fields: Record<string, unknown>,
    hooks: {
      onEntries?: (entries: any[]) => void;
      onData?: (data: Uint8Array) => void;
      upload?: (id: string, isActive: () => boolean) => Promise<void>;
    } = {}
  ) {
    try {
      await this.#socket.ensureOpen();
    } catch (error) {
      if (error instanceof SandboxAccessError) unsentErrors.add(error);
      throw error;
    }

    let id = createRequestId();

    return new Promise<Record<string, any>>((resolve, reject) => {
      let isFinished = false;

      let finish = (settle: () => void) => {
        if (isFinished) return;
        isFinished = true;
        this.#pending.delete(id);
        settle();
      };

      this.#pending.set(id, {
        onEntries: hooks.onEntries,
        onData: hooks.onData,
        resolve: result => finish(() => resolve(result)),
        reject: error => finish(() => reject(error))
      });

      if (!this.#socket.sendIfOpen(JSON.stringify({ id, op, ...fields }))) {
        let error = new SandboxAccessError('disconnected', 'The file connection was lost.', {
          retryable: true
        });
        unsentErrors.add(error);
        return finish(() => reject(error));
      }

      hooks
        .upload?.(id, () => !isFinished)
        .catch(error => {
          this.#socket.sendIfOpen(
            JSON.stringify({ id: createRequestId(), op: 'cancel', target: id })
          );
          finish(() => reject(error));
        });
    });
  }
}
