import { SandboxAccessCache } from './access';
import { createClosedError } from './errors';

export type SandboxFetch = (input: string, init?: RequestInit) => Promise<Response>;

export type SandboxPortBody =
  | string
  | Uint8Array
  | ArrayBuffer
  | Blob
  | URLSearchParams
  | FormData;

export interface SandboxPortRequestInit extends Omit<RequestInit, 'body' | 'method'> {
  method?: string;
  body?: SandboxPortBody | Record<string, unknown> | unknown[] | null;
}

let TOKEN_HEADER = 'Metorial-Sandbox-Token';

let isRawBody = (body: unknown) =>
  typeof body == 'string' ||
  body instanceof Uint8Array ||
  body instanceof ArrayBuffer ||
  (typeof Blob != 'undefined' && body instanceof Blob) ||
  (typeof URLSearchParams != 'undefined' && body instanceof URLSearchParams) ||
  (typeof FormData != 'undefined' && body instanceof FormData);

export class SandboxPort {
  readonly port: number;

  #access: SandboxAccessCache;
  #fetch: SandboxFetch;
  #closed = false;
  #url = '';

  constructor(port: number, access: SandboxAccessCache, opts: { fetch?: SandboxFetch } = {}) {
    this.port = port;
    this.#access = access;
    this.#fetch = opts.fetch ?? ((input, init) => globalThis.fetch(input, init));
  }

  static async connect(
    port: number,
    access: SandboxAccessCache,
    opts?: { fetch?: SandboxFetch }
  ) {
    let connection = new SandboxPort(port, access, opts);
    connection.#url = (await access.get()).url;
    return connection;
  }

  get url() {
    return this.#url;
  }

  get isClosed() {
    return this.#closed;
  }

  async getToken() {
    return (await this.#access.get()).token;
  }

  async fetch(path: string, init: SandboxPortRequestInit = {}): Promise<Response> {
    if (this.#closed) throw createClosedError();

    let { body, ...rest } = init;
    let headers = new Headers(init.headers);
    let requestBody: BodyInit | null | undefined;

    if (body === undefined || body === null) {
      requestBody = body;
    } else if (isRawBody(body)) {
      requestBody = body as BodyInit;
    } else {
      requestBody = JSON.stringify(body);
      if (!headers.has('content-type')) headers.set('content-type', 'application/json');
    }

    let send = async () => {
      let grant = await this.#access.get();
      this.#url = grant.url;
      headers.set(TOKEN_HEADER, grant.token);

      return this.#fetch(this.#resolve(grant.url, path), {
        ...rest,
        headers,
        body: requestBody
      });
    };

    let response = await send();

    if (response.status == 401) {
      this.#access.invalidate();
      response = await send();
    }

    return response;
  }

  get(path: string, init?: Omit<SandboxPortRequestInit, 'body'>) {
    return this.fetch(path, { ...init, method: 'GET' });
  }

  head(path: string, init?: Omit<SandboxPortRequestInit, 'body'>) {
    return this.fetch(path, { ...init, method: 'HEAD' });
  }

  delete(path: string, init?: SandboxPortRequestInit) {
    return this.fetch(path, { ...init, method: 'DELETE' });
  }

  post(path: string, body?: SandboxPortRequestInit['body'], init?: SandboxPortRequestInit) {
    return this.fetch(path, { ...init, method: 'POST', body });
  }

  put(path: string, body?: SandboxPortRequestInit['body'], init?: SandboxPortRequestInit) {
    return this.fetch(path, { ...init, method: 'PUT', body });
  }

  patch(path: string, body?: SandboxPortRequestInit['body'], init?: SandboxPortRequestInit) {
    return this.fetch(path, { ...init, method: 'PATCH', body });
  }

  close() {
    this.#closed = true;
  }

  #resolve(base: string, path: string) {
    if (/^https?:\/\//i.test(path)) {
      let target = new URL(path);
      if (target.origin != new URL(base).origin) {
        throw new TypeError(`${path} is not on the sandbox port ${this.port}.`);
      }
      return target.toString();
    }

    return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
  }
}
