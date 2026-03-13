# Metorial + Vercel AI SDK (v4/v5)

Same as [`typescript-ai-sdk`](../typescript-ai-sdk/) but imports from `@metorial/ai-sdk/v4` for compatibility with older AI SDK versions.

## What's different

The only code change is the import path:

```typescript
// v6 (default)
import { metorialAiSdk } from '@metorial/ai-sdk';

// v4/v5 (this example)
import { metorialAiSdk } from '@metorial/ai-sdk/v4';
```

The v4 adapter uses the older `parameters` tool format instead of v5+'s `inputSchema` format. Everything else — `streamText()`, `stepCountIs()`, session management, OAuth — is identical.

## Environment variables

- `METORIAL_API_KEY` — get one at [platform.metorial.com](https://platform.metorial.com)
- `ANTHROPIC_API_KEY` — from [console.anthropic.com](https://console.anthropic.com)

## Run

```bash
bun install
METORIAL_API_KEY=... ANTHROPIC_API_KEY=... bun start
```

See the [`typescript-ai-sdk`](../typescript-ai-sdk/) README for a full code walkthrough.
