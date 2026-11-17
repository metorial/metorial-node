import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { apiHostFromToken, resolveApiHost } from './apiHost';

let fixtures: { name: string; token: string; host: string | null }[] = JSON.parse(
  readFileSync(join(__dirname, '../../../testdata/api-key-hosts.json'), 'utf8')
);

describe('API host resolution', () => {
  it.each(fixtures)('$name', ({ token, host }) => {
    expect(apiHostFromToken(token)).toBe(host ?? undefined);
    expect(resolveApiHost({ apiKey: token })).toBe(host ?? 'https://api.metorial.com');
    expect(resolveApiHost({ apiKey: token, apiHost: 'https://override.test' })).toBe(
      'https://override.test'
    );
  });

  it('preserves explicit cloud and empty overrides', () => {
    let apiKey = fixtures[0].token;

    expect(resolveApiHost({ apiKey, apiHost: 'https://api.metorial.com' })).toBe(
      'https://api.metorial.com'
    );
    expect(resolveApiHost({ apiKey, apiHost: '' })).toBe('');
  });

  it('falls back when no token is provided or a token is oversized', () => {
    expect(resolveApiHost({})).toBe('https://api.metorial.com');
    expect(apiHostFromToken('metorial_sk_' + 'A'.repeat(8192) + 'v2')).toBeUndefined();
  });

  it('decodes without Node Buffer in browsers', () => {
    vi.stubGlobal('Buffer', undefined);

    try {
      expect(apiHostFromToken(fixtures[0].token)).toBe('https://metorial.test/v1');
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
