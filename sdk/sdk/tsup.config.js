import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  splitting: false,
  sourcemap: true,
  clean: true,
  bundle: true,
  dts: true,
  treeshake: true,
  noExternal: ['@metorial/generated'],
  external: [
    '@metorial/openai',
    '@metorial/anthropic',
    '@metorial/deepseek',
    '@metorial/google',
    '@metorial/mistral',
    '@metorial/togetherai',
    '@metorial/xai',
    '@metorial/ai-sdk',
    'openai',
    '@anthropic-ai/sdk',
    '@google/genai',
    '@mistralai/mistralai'
  ]
});
