# Metorial + OpenAI-Compatible API

Uses any OpenAI-compatible API with [Metorial](https://metorial.com) MCP tools via the generic `@metorial/openai-compatible` adapter. This works with Ollama, LiteLLM, or any provider that implements the OpenAI chat completions format.

## Environment variables

- `METORIAL_API_KEY` — get one at [platform.metorial.com](https://platform.metorial.com)
- `OPENAI_API_KEY` — or the API key for your OpenAI-compatible provider

## Run

```bash
bun install
METORIAL_API_KEY=... OPENAI_API_KEY=... bun start
```

## How it works

The key difference from the other examples is the adapter. Instead of a provider-specific adapter like `metorialOpenAI`, you create a generic one with `createOpenAICompatibleMcpSdk({})`:

```typescript
import { createOpenAICompatibleMcpSdk } from "@metorial/openai-compatible";
import { Metorial } from "metorial";
import OpenAI from "openai";

let metorial = new Metorial({ apiKey: process.env.METORIAL_API_KEY! });
let openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

let metorialOpenAICompatible = createOpenAICompatibleMcpSdk({});
```

Use this adapter exactly like any other — pass it to `withProviderSession()` and the rest is the same:

```typescript
let deployment = await metorial.providerDeployments.create({
  name: "Metorial Search",
  providerId: "metorial-search",
});

await metorial.withProviderSession(
  metorialOpenAICompatible,
  { providers: [{ providerDeploymentId: deployment.id }] },
  async (session) => {
    // session.tools is in OpenAI function calling format
    // session.callTools() executes tool calls and returns results

    for (let i = 0; i < 10; i++) {
      let response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages,
        tools: session.tools as any,
      });
      // ... same tool call loop as the OpenAI example
    }
  }
);
```

## When to use this

Use `@metorial/openai-compatible` when your LLM isn't directly supported by Metorial but offers an OpenAI-compatible API. For supported LLMs (DeepSeek, TogetherAI, xAI), prefer the dedicated packages — they may include provider-specific optimizations.

## Adding OAuth providers

Uncomment the OAuth section in `src/index.ts` to add providers like GitHub or Slack. See the [main README](../../README.md#oauth-flow) for details.
