import { SandboxAccessCache } from './access';
import { SandboxAccessError, createClosedError, describeSocketClose } from './errors';

export interface SandboxConnectionNotice {
  notice: string;
  reason?: string;
  idleInSeconds?: number;
}

export interface SandboxConnectionOptions {
  ttlSeconds?: number;
  onNotice?: (notice: SandboxConnectionNotice) => void;
}

interface SocketLike {
  readyState: number;
  binaryType: string;
  bufferedAmount: number;
  send(data: string | ArrayBufferView | ArrayBuffer): void;
  close(code?: number, reason?: string): void;
  addEventListener(type: string, listener: (event: any) => void): void;
}

type SocketConstructor = new (url: string, protocols: string[]) => SocketLike;

let SOCKET_OPEN = 1;
let MAX_CONNECT_ATTEMPTS = 3;
let CONNECT_BASE_DELAY_MS = 300;

let textEncoder = new TextEncoder();
let textDecoder = new TextDecoder();

let socketConstructor: Promise<SocketConstructor> | null = null;

let loadSocketConstructor = () => {
  socketConstructor ??= (async () => {
    let global = (globalThis as any).WebSocket;
    if (typeof global == 'function') return global as SocketConstructor;

    let mod: any = await import('ws');
    return (mod.WebSocket ?? mod.default ?? mod) as SocketConstructor;
  })();

  return socketConstructor;
};

export let getSandboxSocketProtocols = (token: string) => [
  'metorial-sandbox-v1',
  `metorial-sandbox-token.${token}`
];

let idCounter = 0;
let idPrefix = Math.random().toString(36).slice(2, 8);

export let createRequestId = () => `${idPrefix}_${(++idCounter).toString(36)}`;

export let encodeFrame = (id: string, payload: Uint8Array, tag?: number) => {
  let idBytes = textEncoder.encode(id);
  let header = 1 + idBytes.length + (tag === undefined ? 0 : 1);
  let frame = new Uint8Array(header + payload.length);

  frame[0] = idBytes.length;
  frame.set(idBytes, 1);
  if (tag !== undefined) frame[1 + idBytes.length] = tag;
  frame.set(payload, header);

  return frame;
};

export let decodeFrame = (data: Uint8Array, hasTag = false) => {
  let idLength = data[0];
  if (idLength === undefined || data.length < 1 + idLength + (hasTag ? 1 : 0)) return null;

  let id = textDecoder.decode(data.subarray(1, 1 + idLength));
  let offset = 1 + idLength;
  let tag = hasTag ? data[offset++] : undefined;

  return { id, tag, payload: data.subarray(offset) };
};

let toBytes = (data: unknown): Uint8Array | null => {
  if (data instanceof Uint8Array) return data;
  if (data instanceof ArrayBuffer) return new Uint8Array(data);
  if (ArrayBuffer.isView(data)) {
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  }
  return null;
};

export let concatBytes = (parts: Uint8Array[]) => {
  let total = parts.reduce((sum, part) => sum + part.length, 0);
  let out = new Uint8Array(total);
  let offset = 0;

  for (let part of parts) {
    out.set(part, offset);
    offset += part.length;
  }

  return out;
};

let sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface SandboxMuxSocketOptions {
  access: SandboxAccessCache;
  onText: (message: Record<string, any>) => void;
  onBinary: (data: Uint8Array) => void;
  onDisconnect: (error: SandboxAccessError) => void;
  onNotice?: (notice: SandboxConnectionNotice) => void;
}

let RECONNECT_CODES = new Set([
  'disconnected',
  'unauthorized',
  'rate_limited',
  'machine_restarting',
  'machine_unavailable'
]);
let MAX_RECONNECT_DELAY_MS = 10 * 1000;

export class SandboxMuxSocket {
  #socket: SocketLike | null = null;
  #opening: Promise<SocketLike> | null = null;
  #closed = false;
  #reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  #reconnectAttempt = 0;

  constructor(private readonly opts: SandboxMuxSocketOptions) {}

  get isClosed() {
    return this.#closed;
  }

  ensureOpen(): Promise<SocketLike> {
    if (this.#closed) return Promise.reject(createClosedError());
    if (this.#socket && this.#socket.readyState == SOCKET_OPEN) {
      return Promise.resolve(this.#socket);
    }

    this.#opening ??= this.#connect().finally(() => {
      this.#opening = null;
    });

    return this.#opening;
  }

  async send(data: string | Uint8Array) {
    let socket = await this.ensureOpen();
    socket.send(data);
    return socket;
  }

  sendIfOpen(data: string | Uint8Array) {
    if (!this.#socket || this.#socket.readyState != SOCKET_OPEN) return false;

    try {
      this.#socket.send(data);
      return true;
    } catch {
      return false;
    }
  }

  async waitForDrain(highWaterMark: number) {
    while (this.#socket && this.#socket.bufferedAmount > highWaterMark) {
      if (this.#socket.readyState != SOCKET_OPEN) return;
      await sleep(10);
    }
  }

  close() {
    if (this.#closed) return;
    this.#closed = true;

    if (this.#reconnectTimer) clearTimeout(this.#reconnectTimer);
    this.#reconnectTimer = null;

    let socket = this.#socket;
    this.#socket = null;

    try {
      socket?.close(1000, 'closed');
    } catch {}

    this.opts.onDisconnect(createClosedError());
  }

  #scheduleReconnect() {
    if (this.#closed || this.#reconnectTimer) return;

    let delay = Math.min(
      CONNECT_BASE_DELAY_MS * 2 ** this.#reconnectAttempt++,
      MAX_RECONNECT_DELAY_MS
    );

    this.#reconnectTimer = setTimeout(() => {
      this.#reconnectTimer = null;
      this.ensureOpen().then(
        () => {
          this.#reconnectAttempt = 0;
        },
        error => {
          if (error instanceof SandboxAccessError && RECONNECT_CODES.has(error.code)) {
            this.#scheduleReconnect();
          }
        }
      );
    }, delay);

    (this.#reconnectTimer as any)?.unref?.();
  }

  async #connect() {
    let lastError: SandboxAccessError | null = null;

    for (let attempt = 1; attempt <= MAX_CONNECT_ATTEMPTS; attempt++) {
      if (attempt > 1) await sleep(CONNECT_BASE_DELAY_MS * 2 ** (attempt - 2));
      if (this.#closed) throw createClosedError();

      let grant = await this.opts.access.get();
      let result = await this.#open(grant.url, grant.token);

      if (this.#closed) {
        if ('socket' in result) result.socket.close(1000, 'closed');
        throw createClosedError();
      }

      if ('socket' in result) {
        this.#socket = result.socket;
        return result.socket;
      }

      lastError = result.error;
      if (!lastError.retryable) throw lastError;

      this.opts.access.invalidate();
    }

    throw lastError!;
  }

  async #open(
    url: string,
    token: string
  ): Promise<{ socket: SocketLike } | { error: SandboxAccessError }> {
    let Socket = await loadSocketConstructor();

    let socket: SocketLike;
    try {
      socket = new Socket(url, getSandboxSocketProtocols(token));
    } catch (error) {
      return {
        error: new SandboxAccessError('disconnected', (error as Error)?.message, {
          retryable: true
        })
      };
    }

    socket.binaryType = 'arraybuffer';

    return new Promise(resolve => {
      let hasOpened = false;

      socket.addEventListener('open', () => {
        hasOpened = true;
        resolve({ socket });
      });

      socket.addEventListener('error', () => {});

      socket.addEventListener('message', event => this.#handleMessage(event.data));

      socket.addEventListener('close', event => {
        let error = describeSocketClose(event.code, String(event.reason ?? ''));
        if (!hasOpened) return resolve({ error });

        if (error.code == 'unauthorized') this.opts.access.invalidate();
        if (this.#socket !== socket) return;

        this.#socket = null;
        this.opts.onDisconnect(error);

        if (RECONNECT_CODES.has(error.code)) this.#scheduleReconnect();
      });
    });
  }

  #handleMessage(data: unknown) {
    if (typeof data != 'string') {
      let bytes = toBytes(data);
      if (bytes) this.opts.onBinary(bytes);
      return;
    }

    let message: Record<string, any>;
    try {
      message = JSON.parse(data);
    } catch {
      return;
    }

    if (!message || typeof message != 'object') return;

    if (message.type == 'connection_notice') {
      this.opts.onNotice?.({
        notice: String(message.notice ?? ''),
        ...(typeof message.reason == 'string' && { reason: message.reason }),
        ...(typeof message.idleInSeconds == 'number' && {
          idleInSeconds: message.idleInSeconds
        })
      });
      return;
    }

    this.opts.onText(message);
  }
}
