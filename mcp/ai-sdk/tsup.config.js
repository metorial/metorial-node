import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/v4.ts'],
  format: ['esm', 'cjs'],
  splitting: false,
  sourcemap: true,
  clean: true,
  bundle: true,
  dts: true,
  treeshake: true,
  noExternal: ['@metorial/generated']
});
