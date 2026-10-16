import { SandboxAccessCache } from './access';
import { SandboxAccessError, SandboxCommandError, createServerError } from './errors';
import {
  SandboxConnectionOptions,
  SandboxMuxSocket,
  concatBytes,
  createRequestId,
  decodeFrame,
  encodeFrame
} from './socket';

export interface SandboxSpawnOptions {
  cwd?: string;
  env?: Record<string, string>;
  timeoutMs?: number;
  stdin?: boolean;
  onStdout?: (data: Uint8Array) => void;
  onStderr?: (data: Uint8Array) => void;
}

export interface SandboxCommandOptions extends Omit<SandboxSpawnOptions, 'stdin'> {
  stdin?: string | Uint8Array;
}

export interface SandboxProcessExit {
  exitCode: number | null;
  signal: string | null;
  timedOut: boolean;
}

export interface SandboxCommandResult extends SandboxProcessExit {
  stdout: string;
  stderr: string;
  stdoutBytes: Uint8Array;
  stderrBytes: Uint8Array;
}

export type SandboxCommand = string | string[];

let STDERR = 2;

let textEncoder = new TextEncoder();
let textDecoder = new TextDecoder();

let toArgv = (command: SandboxCommand) =>
  typeof command == 'string' ? ['/bin/sh', '-c', command] : command;

export class SandboxProcess {
  readonly id: string;
  pid: number | null = null;

  #socket: SandboxMuxSocket;
  #started: Promise<number>;
  #exit: Promise<SandboxProcessExit>;
  #resolveStarted!: (pid: number) => void;
  #resolveExit!: (exit: SandboxProcessExit) => void;
  #reject!: (error: SandboxAccessError) => void;
  #isDone = false;

  #stdoutListeners = new Set<(data: Uint8Array) => void>();
  #stderrListeners = new Set<(data: Uint8Array) => void>();

  constructor(id: string, socket: SandboxMuxSocket) {
    this.id = id;
    this.#socket = socket;

    let rejectStarted!: (error: SandboxAccessError) => void;
    let rejectExit!: (error: SandboxAccessError) => void;

    this.#started = new Promise<number>((resolve, reject) => {
      this.#resolveStarted = resolve;
      rejectStarted = reject;
    });
    this.#exit = new Promise<SandboxProcessExit>((resolve, reject) => {
      this.#resolveExit = resolve;
      rejectExit = reject;
    });

    this.#started.catch(() => {});
    this.#exit.catch(() => {});

    this.#reject = error => {
      rejectStarted(error);
      rejectExit(error);
    };
  }

  get isDone() {
    return this.#isDone;
  }

  started() {
    return this.#started;
  }

  wait() {
    return this.#exit;
  }

  onStdout(listener: (data: Uint8Array) => void) {
    this.#stdoutListeners.add(listener);
    return () => this.#stdoutListeners.delete(listener);
  }

  onStderr(listener: (data: Uint8Array) => void) {
    this.#stderrListeners.add(listener);
    return () => this.#stderrListeners.delete(listener);
  }

  write(data: string | Uint8Array) {
    this.#ensureRunning();

    let bytes = typeof data == 'string' ? textEncoder.encode(data) : data;
    if (!this.#socket.sendIfOpen(encodeFrame(this.id, bytes))) throw this.#lostError();
  }

  closeStdin() {
    this.#sendControl({ type: 'stdin_eof' });
  }

  signal(signal: string) {
    this.#sendControl({ type: 'signal', signal: signal.replace(/^SIG/i, '').toUpperCase() });
  }

  kill() {
    this.signal('KILL');
  }

  handleOutput(stream: number, data: Uint8Array) {
    let listeners = stream == STDERR ? this.#stderrListeners : this.#stdoutListeners;
    for (let listener of listeners) listener(data);
  }

  handleStarted(pid: number) {
    this.pid = pid;
    this.#resolveStarted(pid);
  }

  handleExit(exit: SandboxProcessExit) {
    this.#isDone = true;
    this.#resolveStarted(this.pid ?? -1);
    this.#resolveExit(exit);
  }

  handleError(error: SandboxAccessError) {
    this.#isDone = true;
    this.#reject(error);
  }

  #sendControl(fields: Record<string, unknown>) {
    this.#ensureRunning();
    if (!this.#socket.sendIfOpen(JSON.stringify({ id: this.id, ...fields }))) {
      throw this.#lostError();
    }
  }

  #ensureRunning() {
    if (this.#isDone) {
      throw new SandboxCommandError('unknown_command', 'The command has already finished.');
    }
  }

  #lostError() {
    return new SandboxCommandError('connection_interrupted', 'The shell connection was lost.');
  }
}

export class SandboxShell {
  #socket: SandboxMuxSocket;
  #processes = new Map<string, SandboxProcess>();

  constructor(access: SandboxAccessCache, opts: SandboxConnectionOptions = {}) {
    this.#socket = new SandboxMuxSocket({
      access,
      onNotice: opts.onNotice,
      onText: message => this.#handleText(message),
      onBinary: data => {
        let frame = decodeFrame(data, true);
        if (frame) this.#processes.get(frame.id)?.handleOutput(frame.tag!, frame.payload);
      },
      onDisconnect: error => {
        let interrupted =
          error.code == 'closed'
            ? error
            : new SandboxCommandError('connection_interrupted', error.message);

        for (let proc of [...this.#processes.values()]) proc.handleError(interrupted);
        this.#processes.clear();
      }
    });
  }

  static async connect(access: SandboxAccessCache, opts?: SandboxConnectionOptions) {
    let shell = new SandboxShell(access, opts);
    await shell.#socket.ensureOpen();
    return shell;
  }

  get isClosed() {
    return this.#socket.isClosed;
  }

  async spawn(command: SandboxCommand, opts: SandboxSpawnOptions = {}) {
    await this.#socket.ensureOpen();

    let id = createRequestId();
    let proc = new SandboxProcess(id, this.#socket);

    if (opts.onStdout) proc.onStdout(opts.onStdout);
    if (opts.onStderr) proc.onStderr(opts.onStderr);

    this.#processes.set(id, proc);

    let sent = this.#socket.sendIfOpen(
      JSON.stringify({
        id,
        op: 'run',
        v: 1,
        command: toArgv(command),
        ...(opts.cwd !== undefined && { cwd: opts.cwd }),
        ...(opts.env !== undefined && { env: opts.env }),
        ...(opts.stdin && { stdin: true }),
        ...(opts.timeoutMs !== undefined && { timeoutMs: opts.timeoutMs })
      })
    );

    if (!sent) {
      this.#processes.delete(id);
      proc.handleError(
        new SandboxCommandError('connection_interrupted', 'The shell connection was lost.')
      );
    }

    return proc;
  }

  async command(command: SandboxCommand, opts: SandboxCommandOptions = {}) {
    let stdout: Uint8Array[] = [];
    let stderr: Uint8Array[] = [];

    let proc = await this.spawn(command, {
      ...opts,
      stdin: opts.stdin !== undefined,
      onStdout: data => {
        stdout.push(data.slice());
        opts.onStdout?.(data);
      },
      onStderr: data => {
        stderr.push(data.slice());
        opts.onStderr?.(data);
      }
    });

    if (opts.stdin !== undefined && !proc.isDone) {
      if (opts.stdin.length) proc.write(opts.stdin);
      proc.closeStdin();
    }

    let exit = await proc.wait();
    let stdoutBytes = concatBytes(stdout);
    let stderrBytes = concatBytes(stderr);

    return {
      ...exit,
      stdout: textDecoder.decode(stdoutBytes),
      stderr: textDecoder.decode(stderrBytes),
      stdoutBytes,
      stderrBytes
    } satisfies SandboxCommandResult;
  }

  close() {
    this.#socket.close();
  }

  #handleText(message: Record<string, any>) {
    if (typeof message.id != 'string') return;

    let proc = this.#processes.get(message.id);
    if (!proc) return;

    switch (message.type) {
      case 'started':
        return proc.handleStarted(Number(message.pid));

      case 'exit':
        this.#processes.delete(message.id);
        return proc.handleExit({
          exitCode: typeof message.code == 'number' ? message.code : null,
          signal: typeof message.signal == 'string' ? message.signal : null,
          timedOut: message.timedOut === true
        });

      case 'error':
        this.#processes.delete(message.id);
        return proc.handleError(createServerError(message.error ?? {}, SandboxCommandError));
    }
  }
}
