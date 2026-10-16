import type { MetorialSandboxMachinesAccessEndpoint } from '@metorial/generated';
import { createSandboxAccessCache } from './access';
import { SandboxAccessError } from './errors';
import { SandboxFiles } from './files';
import { SandboxFetch, SandboxPort } from './port';
import { SandboxShell } from './shell';
import { SandboxConnectionOptions } from './socket';

export * from './access';
export * from './errors';
export * from './files';
export * from './port';
export * from './shell';
export { getSandboxSocketProtocols } from './socket';
export type { SandboxConnectionNotice, SandboxConnectionOptions } from './socket';

export interface SandboxPortOptions {
  ttlSeconds?: number;
  fetch?: SandboxFetch;
}

let requireUrl = (url: string | null | undefined, kind: string) => {
  if (!url) {
    throw new SandboxAccessError(
      'unavailable',
      `${kind} access is not available for this machine.`
    );
  }
  return url;
};

export let createSandboxMachineConnections = (
  access: MetorialSandboxMachinesAccessEndpoint
) => ({
  files: (machineId: string, opts: SandboxConnectionOptions = {}) =>
    SandboxFiles.connect(
      createSandboxAccessCache(async () => {
        let grant = await access.files(machineId, { ttlSeconds: opts.ttlSeconds });
        return { ...grant, url: requireUrl(grant.urls.files, 'File') };
      }),
      opts
    ),

  shell: (machineId: string, opts: SandboxConnectionOptions = {}) =>
    SandboxShell.connect(
      createSandboxAccessCache(async () => {
        let grant = await access.shell(machineId, { ttlSeconds: opts.ttlSeconds });
        return { ...grant, url: requireUrl(grant.urls.exec, 'Command') };
      }),
      opts
    ),

  connect: (machineId: string, port: number, opts: SandboxPortOptions = {}) =>
    SandboxPort.connect(
      port,
      createSandboxAccessCache(async () => {
        let grant = await access.ports(machineId, {
          ports: [port],
          ttlSeconds: opts.ttlSeconds
        });
        return { ...grant, url: requireUrl(grant.urls.ports?.[String(port)], `Port ${port}`) };
      }),
      { fetch: opts.fetch }
    )
});
