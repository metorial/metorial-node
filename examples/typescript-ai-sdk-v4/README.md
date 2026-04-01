# Metorial + Vercel AI SDK (v4)

Same as [`typescript-ai-sdk`](../typescript-ai-sdk/) but imports from `@metorial/ai-sdk/v4` for projects still on AI SDK v4.

## What's different

The only code change is the import path:

```typescript
// v5+ (default) — uses `inputSchema` tool format
import { metorialAiSdk } from '@metorial/ai-sdk';

// v4 (this example) — uses `parameters` tool format
import { metorialAiSdk } from '@metorial/ai-sdk/v4';
```

AI SDK v4 uses `parameters` in tool definitions, while v5+ uses `inputSchema`. The default adapter targets v5+/v6. Use this `/v4` subpath if your project is on AI SDK v4. The example still uses `streamText()`, but the step limit is configured with `maxSteps` instead of the newer `stepCountIs()` helper.

## Environment variables

- `METORIAL_API_KEY` — get one at [platform.metorial.com](https://platform.metorial.com)
- `OPENAI_API_KEY` — from [platform.openai.com](https://platform.openai.com)

## Run

```bash
bun install
bun start
```

See the [`typescript-ai-sdk`](../typescript-ai-sdk/) README for a full code walkthrough.
