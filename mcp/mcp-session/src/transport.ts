import {
  type FetchLike,
  type Transport
} from '@modelcontextprotocol/sdk/shared/transport.js';
import { type JSONRPCMessage, JSONRPCMessageSchema } from '@modelcontextprotocol/sdk/types.js';
import { EventSourceParserStream } from 'eventsource-parser/stream';

function normalizeHeaders(
  headers: HeadersInit | undefined
): Record<string, string> {
  if (!headers) return {};
  if (headers instanceof Headers) {
    let result: Record<string, string> = {};
    headers.forEach((value, key) => { result[key] = value; });
    return result;
  }
  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }
  return headers as Record<string, string>;
}

export class MetorialMcpTransportError extends Error {
  constructor(
    public readonly code: number | undefined,
    message: string | undefined
  ) {
    super(`Streamable HTTP error: ${message}`);
  }
}

export type MetorialMcpTransportOptions = {
  requestInit?: RequestInit;
  fetch?: FetchLike;
};

export class MetorialMcpTransport implements Transport {
  private abortController?: AbortController;
  private url: URL;
  private requestInit?: RequestInit;
  private fetch?: FetchLike;
  private _sessionId?: string;
  private _protocolVersion?: string;
  onclose?: () => void;
  onerror?: (error: Error) => void;
  onmessage?: (message: JSONRPCMessage) => void;

  constructor(url: URL, opts?: MetorialMcpTransportOptions) {
    this.url = url;
    this.requestInit = opts?.requestInit;
    this.fetch = opts?.fetch;
  }

  async start() {
    if (this.abortController) return;
    this.abortController = new AbortController();
  }

  async close(): Promise<void> {
    this.abortController?.abort();
    this.onclose?.();
  }

  async send(message: JSONRPCMessage | JSONRPCMessage[]): Promise<void> {
    try {
      let headers = await this.getHeaders();
      headers.set('content-type', 'application/json');
      headers.set('accept', 'application/json, text/event-stream');

      let init = {
        ...this.requestInit,
        method: 'POST',
        headers,
        body: JSON.stringify(message),
        signal: this.abortController?.signal
      };

      let response = await (this.fetch ?? fetch)(this.url, init);

      let sessionId = response.headers.get('mcp-session-id');
      if (sessionId) this._sessionId = sessionId;

      if (!response.ok) {
        let text = await response.text().catch(() => null);
        throw new MetorialMcpTransportError(
          response.status,
          `Error POSTing to endpoint: ${text}`
        );
      }

      if (response.status === 202) {
        await response.body?.cancel();
        return;
      }

      let messages = Array.isArray(message) ? message : [message];
      let hasRequests =
        messages.filter(msg => 'method' in msg && 'id' in msg && msg.id !== undefined).length >
        0;

      let contentType = response.headers.get('content-type');

      if (hasRequests) {
        if (contentType?.includes('text/event-stream')) {
          this.handleSseStream(response.body);
        } else if (contentType?.includes('application/json')) {
          let data = await response.json();
          let responseMessages = Array.isArray(data)
            ? data.map(msg => JSONRPCMessageSchema.parse(msg))
            : [JSONRPCMessageSchema.parse(data)];
          for (let msg of responseMessages) {
            this.onmessage?.(msg);
          }
        } else {
          await response.body?.cancel();
          throw new MetorialMcpTransportError(-1, `Unexpected content type: ${contentType}`);
        }
      } else {
        await response.body?.cancel();
      }
    } catch (error) {
      this.onerror?.(error as Error);
      throw error;
    }
  }

  get sessionId(): string | undefined {
    return this._sessionId;
  }

  setProtocolVersion(version: string): void {
    this._protocolVersion = version;
  }

  get protocolVersion(): string | undefined {
    return this._protocolVersion;
  }

  async terminateSession(): Promise<void> {
    if (!this._sessionId) return;
    try {
      let headers = await this.getHeaders();
      let init = {
        ...this.requestInit,
        method: 'DELETE',
        headers,
        signal: this.abortController?.signal
      };

      let response = await (this.fetch ?? fetch)(this.url, init);
      await response.body?.cancel();

      if (!response.ok && response.status !== 405) {
        throw new MetorialMcpTransportError(
          response.status,
          `Failed to terminate session: ${response.statusText}`
        );
      }

      this._sessionId = undefined;
    } catch (error) {
      this.onerror?.(error as Error);
      throw error;
    }
  }

  private async getHeaders(): Promise<Headers> {
    let headers: Record<string, string> = {};
    if (this._sessionId) headers['mcp-session-id'] = this._sessionId;
    if (this._protocolVersion) headers['mcp-protocol-version'] = this._protocolVersion;

    let extraHeaders = normalizeHeaders(this.requestInit?.headers);
    return new Headers({
      ...headers,
      ...extraHeaders
    });
  }

  private handleSseStream(stream: ReadableStream<Uint8Array> | null): void {
    if (!stream) return;

    let processStream = async () => {
      try {
        let reader = stream
          .pipeThrough(new TextDecoderStream() as ReadableWritablePair<string, Uint8Array>)
          .pipeThrough(new EventSourceParserStream({}))
          .getReader();

        while (true) {
          let { value: event, done } = await reader.read();
          if (done) break;
          if (!event) continue;

          if (!event.data) continue;

          if (!event.event || event.event === 'message') {
            try {
              let message = JSONRPCMessageSchema.parse(JSON.parse(event.data));
              this.onmessage?.(message);
            } catch (error) {
              this.onerror?.(error as Error);
            }
          }
        }
      } catch (error) {
        this.onerror?.(new Error(`SSE stream disconnected: ${error}`));
      }
    };

    processStream();
  }
}
