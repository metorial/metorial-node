import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/compact.ts'],
  format: ['esm', 'cjs'],
  splitting: false,
  sourcemap: true,
  clean: true,
  bundle: true,
  dts: true
});
