import { mapDashboardInstanceFilesGetOutput } from '@metorial/generated';
import { MetorialEndpointManager, MetorialSDKError } from '@metorial/util-endpoint';

export type MetorialFileUploadMode = 'direct' | 'presigned';

export let maxDirectUploadBytes = 100 * 1024 * 1024;

export type MetorialFileUploadInput = {
  file: File | Blob;
  purpose: string;
  title?: string;
  store?: {
    id: string;
    path: string;
  };
  storeReplace?: boolean;
  fileName?: string;
  mode?: MetorialFileUploadMode;
};

let rawJson = { transformFrom: (input: any) => input };

let getFileName = (input: MetorialFileUploadInput) =>
  input.fileName ?? (input.file as File).name ?? 'file';

let uploadDirect = async (
  manager: MetorialEndpointManager<any>,
  input: MetorialFileUploadInput
) => {
  let body = new FormData();
  body.append('file', input.file, getFileName(input));
  body.append('purpose', input.purpose);
  if (input.title) body.append('title', input.title);
  if (input.store) {
    body.append('store_id', input.store.id);
    body.append('path', input.store.path);
  }
  if (input.storeReplace) body.append('store_replace', 'true');

  return await manager._post({ path: ['files'], body }).transform(rawJson);
};

let uploadPresigned = async (
  manager: MetorialEndpointManager<any>,
  input: MetorialFileUploadInput
) => {
  let pending = await manager
    ._post({
      path: ['files'],
      body: {
        mode: 'get_upload_url',
        purpose: input.purpose,
        file_name: getFileName(input),
        file_size: input.file.size,
        ...(input.file.type ? { file_type: input.file.type } : {}),
        ...(input.title ? { title: input.title } : {}),
        ...(input.store ? { store_id: input.store.id, path: input.store.path } : {}),
        ...(input.storeReplace ? { store_replace: true } : {})
      }
    })
    .transform(rawJson);

  let storageHeaders: Record<string, string> = {
    ...(pending.upload.headers ?? {}),
    ...(input.file.type ? { 'Content-Type': input.file.type } : {})
  };

  let uploaded = await manager.fetch(pending.upload.url, {
    method: pending.upload.method ?? 'PUT',
    headers: storageHeaders,
    body: input.file,
    cache: 'no-cache'
  });

  if (!uploaded.ok) {
    throw new MetorialSDKError({
      status: uploaded.status,
      code: 'file_upload_failed',
      message: `Object store rejected the upload with status ${uploaded.status}`
    });
  }

  return await manager
    ._post({
      path: ['files'],
      body: { mode: 'complete', file_upload_id: pending.id }
    })
    .transform(rawJson);
};

export let uploadFile = async (
  manager: MetorialEndpointManager<any>,
  input: MetorialFileUploadInput
) => {
  let mode = input.mode ?? (input.file.size > maxDirectUploadBytes ? 'presigned' : 'direct');

  let json =
    mode === 'presigned'
      ? await uploadPresigned(manager, input)
      : await uploadDirect(manager, input);

  return mapDashboardInstanceFilesGetOutput.transformFrom(json);
};
