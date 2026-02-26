import { defineConfig } from 'tsup';

export default defineConfig(
  ['mt_2025_01_01_dashboard', 'mt_2025_01_01_pulsar', 'mt_2026_01_01_magnetar'].map(version => ({
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
