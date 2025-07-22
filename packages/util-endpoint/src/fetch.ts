import fetch, { Headers, Request, Response } from 'cross-fetch';

if (typeof globalThis.fetch !== 'function') {
  globalThis.fetch = fetch;
  globalThis.Headers = Headers;
  globalThis.Request = Request;
  globalThis.Response = Response;
}
