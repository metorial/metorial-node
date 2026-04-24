import { defineConfig } from 'tsup';
import fs from 'node:fs';
import path from 'node:path';

let versions = fs
  .readdirSync('src', { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .map(entry => entry.name)
  .filter(version => fs.existsSync(path.join('src', version, 'index.ts')));

export default defineConfig(
  versions.map(version => ({
    entry: [`src/${version}/index.ts`],
    format: ['esm', 'cjs'],
    splitting: false,
    sourcemap: true,
    clean: true,
    bundle: true,
    dts: true,
    outDir: `dist/${version}`
  }))
);
