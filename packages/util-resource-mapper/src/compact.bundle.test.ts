import { build } from 'esbuild';
import { mkdtemp, mkdir, rm, symlink, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

let packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

let require = createRequire(import.meta.url);

describe('compact package exports', () => {
  it('supports the CommonJS compact subpath and retains legacy exports', () => {
    let compact = require('@metorial/util-resource-mapper/compact');
    let legacy = require('@metorial/util-resource-mapper');

    expect(compact.mapObject(['some_key']).transformFrom({ some_key: 1 })).toEqual({
      someKey: 1
    });
    expect(
      legacy.mtMap
        .object({ value: legacy.mtMap.objectField('wire_value', legacy.mtMap.passthrough()) })
        .transformFrom({ wire_value: 2 })
    ).toEqual({ value: 2 });
  });

  it('excludes legacy builders and unused generated mappers from an ESM bundle', async () => {
    let directory = await mkdtemp(path.join(tmpdir(), 'metorial-compact-bundle-'));

    try {
      await mkdir(path.join(directory, 'node_modules/@metorial'), { recursive: true });
      await symlink(
        packageRoot,
        path.join(directory, 'node_modules/@metorial/util-resource-mapper'),
        'dir'
      );
      await writeFile(
        path.join(directory, 'resources.js'),
        `
        import { mapObject } from '@metorial/util-resource-mapper/compact';
        export let used = /* @__PURE__ */ mapObject(['used_key']);
        export let unused = /* @__PURE__ */ mapObject(['UNUSED_MAPPER_SENTINEL']);
      `
      );
      await writeFile(
        path.join(directory, 'entry.js'),
        `import { used } from './resources.js'; export { used };`
      );

      let result = await build({
        entryPoints: [path.join(directory, 'entry.js')],
        bundle: true,
        write: false,
        metafile: true,
        minify: true,
        format: 'esm',
        platform: 'browser'
      });
      let output = result.outputFiles[0].text;
      let inputs = Object.keys(result.metafile!.inputs);

      expect(output).toContain('used_key');
      expect(output).not.toContain('UNUSED_MAPPER_SENTINEL');
      expect(inputs.some(input => input.endsWith('dist/compact.js'))).toBe(true);
      expect(inputs.some(input => input.endsWith('dist/index.js'))).toBe(false);
      expect(inputs.some(input => input.includes('/mappers/'))).toBe(false);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
});
