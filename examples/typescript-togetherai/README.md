# Metorial + TogetherAI

Uses [TogetherAI](https://www.together.ai/)-hosted models with [Metorial](https://metorial.com) MCP tools. TogetherAI provides an OpenAI-compatible API, so the code uses the `openai` package.

## Environment variables

- `METORIAL_API_KEY` — get one at [platform.metorial.com](https://platform.metorial.com)
- `TOGETHERAI_API_KEY` — from [api.together.ai](https://api.together.ai/)

## Run

```bash
bun install
METORIAL_API_KEY=... TOGETHERAI_API_KEY=... bun start
```

## How it works

Initialize the TogetherAI client as an OpenAI client with Together's base URL:

```typescript
import { metorialTogetherAi } from "@metorial/togetherai";
import { Metorial } from "metorial";
import OpenAI from "openai";

let metorial = new Metorial({ apiKey: process.env.METORIAL_API_KEY! });

let togetherai = new OpenAI({
  apiKey: process.env.TOGETHERAI_API_KEY!,
  baseURL: "https://api.together.xyz/v1",
});
```

The session and tool call loop follow the same pattern as OpenAI. The `metorialTogetherAi` adapter formats tools for Together's API. This example uses `mistralai/Mistral-7B-Instruct-v0.2`, but you can swap in any Together-hosted model that supports function calling:

```typescript
let response = await togetherai.chat.completions.create({
  model: "mistralai/Mistral-7B-Instruct-v0.2",
  messages,
  tools: session.tools,
});
```

## Adding OAuth providers

Uncomment the OAuth section in `src/index.ts` to add providers like GitHub or Slack. See the [main README](../../README.md#oauth-flow) for details.
