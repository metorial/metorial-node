# Metorial + xAI (Grok)

Uses [xAI](https://x.ai/)'s Grok models with [Metorial](https://metorial.com) MCP tools. xAI provides an OpenAI-compatible API, so the code uses the `openai` package.

## Environment variables

- `METORIAL_API_KEY` — get one at [platform.metorial.com](https://platform.metorial.com)
- `XAI_API_KEY` — from [console.x.ai](https://console.x.ai/)

## Run

```bash
bun install
bun start
```

## How it works

```typescript
import { metorialXai } from '@metorial/xai';
import { Metorial } from 'metorial';
import OpenAI from 'openai';

// Initialize the xAI client as an OpenAI client with xAI's base URL.
let metorial = new Metorial({ apiKey: process.env.METORIAL_API_KEY! });

let xai = new OpenAI({
  apiKey: process.env.XAI_API_KEY!,
  baseURL: 'https://api.x.ai/v1'
});

// The session and tool call loop follow the same pattern as OpenAI. Tools are deduplicated
// by function name before being passed to Grok, and `session.callTools()` handles execution.
let uniqueTools = Array.from(new Map(session.tools.map(t => [t.function.name, t])).values());

let response = await xai.chat.completions.create({
  model: 'grok-2-latest',
  messages,
  tools: uniqueTools
});

// ... check for tool_calls, execute via session.callTools(), loop
```

## Adding OAuth providers

Uncomment the OAuth section in `src/index.ts` to add providers like GitHub or Slack. See the [main README](../../README.md#oauth-flow) for details.
