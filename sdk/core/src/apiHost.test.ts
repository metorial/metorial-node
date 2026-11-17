import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createMetorialCoreSDK } from './sdk';

let fixtures: { token: string; host: string | null }[] = JSON.parse(
  readFileSync(new URL('../../../testdata/api-key-hosts.json', import.meta.url), 'utf8')
);

describe('SDK API host selection', () => {
  it.each([
    { apiHost: undefined, expected: 'https://metorial.test/v1/instance' },
    {
      apiHost: 'https://override.test/custom/',
      expected: 'https://override.test/custom/instance'
    },
    { apiHost: 'https://api.metorial.com', expected: 'https://api.metorial.com/instance' }
  ])('requests $expected', async ({ apiHost, expected }) => {
    let apiKey = fixtures[0].token;
    let calls: { url: string; headers: Headers }[] = [];
    let sdk = createMetorialCoreSDK({
      apiKey,
      ...(apiHost === undefined ? {} : { apiHost }),
      fetch: (async (url: string, init: RequestInit) => {
        calls.push({ url, headers: new Headers(init.headers) });
        return new Response(
          JSON.stringify({
            object: 'organization.instance',
            id: 'instance_1',
            slug: 'test',
            name: 'Test',
            organization_id: 'org_1',
            sandbox_id: null,
            type: 'development',
            created_at: '2026-01-01T00:00:00.000Z',
            updated_at: '2026-01-01T00:00:00.000Z',
            project: {
              object: 'organization.project',
              id: 'project_1',
              status: 'active',
              slug: 'test',
              name: 'Test',
              organization_id: 'org_1',
              created_at: '2026-01-01T00:00:00.000Z',
              updated_at: '2026-01-01T00:00:00.000Z'
            }
          }),
          { status: 200 }
        );
      }) as typeof fetch
    });

    expect((await sdk.instance.get()).id).toBe('instance_1');

    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe(expected);
    expect(calls[0].headers.get('Authorization')).toBe(`Bearer ${apiKey}`);
  });

  it('uses the cloud default for opaque keys', () => {
    expect(createMetorialCoreSDK({ apiKey: 'opaque-key' })._config.apiHost).toBe(
      'https://api.metorial.com'
    );
  });
});
