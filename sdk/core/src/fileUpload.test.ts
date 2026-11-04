import { describe, expect, it } from 'vitest';
import { createMetorialCoreSDK } from './sdk';

type Call = { url: string; method: string; headers: Headers; body: any };

let fileResponse = {
  object: 'file',
  id: 'file_1',
  status: 'active',
  file_name: 'notes.txt',
  file_size: 5,
  file_type: 'text/plain',
  title: null,
  purpose: { object: 'file.purpose', name: 'Generic', identifier: 'generic' },
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z'
};

let createSdk = (handler: (call: Call) => Response | Promise<Response>) => {
  let calls: Call[] = [];

  let fetchImpl = async (url: string, init: any) => {
    let call = {
      url,
      method: init.method,
      headers: new Headers(init.headers),
      body: init.body
    };
    calls.push(call);
    return await handler(call);
  };

  let sdk = createMetorialCoreSDK({
    apiKey: 'metorial_sk_test',
    apiHost: 'https://api.test',
    fetch: fetchImpl as any
  });

  return { sdk, calls };
};

let json = (value: any, status = 200) =>
  new Response(JSON.stringify(value), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });

describe('files.upload', () => {
  it('sends small files as multipart', async () => {
    let { sdk, calls } = createSdk(() => json(fileResponse));

    let file = await sdk.files.upload({
      file: new File(['hello'], 'notes.txt', { type: 'text/plain' }),
      purpose: 'generic',
      title: 'Notes',
      store: { id: 'store_1', path: 'docs/notes.txt' },
      storeReplace: true
    });

    expect(file.id).toBe('file_1');
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe('https://api.test/files');
    expect(calls[0].body).toBeInstanceOf(FormData);
    expect(calls[0].body.get('purpose')).toBe('generic');
    expect(calls[0].body.get('title')).toBe('Notes');
    expect(calls[0].body.get('store_id')).toBe('store_1');
    expect(calls[0].body.get('path')).toBe('docs/notes.txt');
    expect(calls[0].body.get('store_replace')).toBe('true');
    expect(calls[0].body.get('file').name).toBe('notes.txt');
  });

  it('uploads through a signed URL and forwards the signed headers', async () => {
    let { sdk, calls } = createSdk(call => {
      if (call.url === 'https://storage.test/blob') return new Response(null, { status: 201 });

      let body = JSON.parse(call.body);
      if (body.mode === 'get_upload_url') {
        return json({
          object: 'file_upload',
          id: 'fup_1',
          upload: {
            url: 'https://storage.test/blob',
            method: 'PUT',
            headers: { 'x-ms-blob-type': 'BlockBlob' }
          }
        });
      }

      return json({ ...fileResponse, id: 'file_2' });
    });

    let file = await sdk.files.upload({
      file: new File(['large contents'], 'archive.bin', { type: 'application/zip' }),
      purpose: 'generic',
      mode: 'presigned'
    });

    expect(file.id).toBe('file_2');
    expect(calls.map(c => c.url)).toEqual([
      'https://api.test/files',
      'https://storage.test/blob',
      'https://api.test/files'
    ]);

    expect(JSON.parse(calls[0].body)).toMatchObject({
      mode: 'get_upload_url',
      purpose: 'generic',
      file_name: 'archive.bin',
      file_size: 14,
      file_type: 'application/zip'
    });

    let put = calls[1];
    expect(put.method).toBe('PUT');
    expect(put.headers.get('x-ms-blob-type')).toBe('BlockBlob');
    expect(put.headers.get('content-type')).toBe('application/zip');
    expect(put.headers.get('authorization')).toBeNull();

    expect(JSON.parse(calls[2].body)).toEqual({ mode: 'complete', file_upload_id: 'fup_1' });
  });

  it('reports storage failures', async () => {
    let { sdk } = createSdk(call => {
      if (call.url === 'https://storage.test/blob') return new Response('no', { status: 403 });

      return json({
        id: 'fup_1',
        upload: { url: 'https://storage.test/blob', method: 'PUT' }
      });
    });

    await expect(
      sdk.files.upload({
        file: new Blob(['x']),
        fileName: 'x.bin',
        purpose: 'generic',
        mode: 'presigned'
      })
    ).rejects.toMatchObject({ response: { code: 'file_upload_failed', status: 403 } });
  });
});
