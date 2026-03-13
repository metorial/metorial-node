# Metorial + DeepSeek

Uses [DeepSeek](https://www.deepseek.com/) with [Metorial](https://metorial.com) MCP tools. DeepSeek provides an OpenAI-compatible API, so the code uses the `openai` package pointed at DeepSeek's base URL.

## Environment variables

- `METORIAL_API_KEY` — get one at [platform.metorial.com](https://platform.metorial.com)
- `DEEPSEEK_API_KEY` — from [platform.deepseek.com](https://platform.deepseek.com/)

## Run

```bash
bun install
bun start
```

## How it works

```typescript
import { metorialDeepseek } from '@metorial/deepseek';
import { Metorial } from 'metorial';
import OpenAI from 'openai';

// Initialize the DeepSeek client as a standard OpenAI client with a custom base URL.
let metorial = new Metorial({ apiKey: process.env.METORIAL_API_KEY! });

let deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY!,
  baseURL: 'https://api.deepseek.com'
});

// Create a Metorial Search deployment and open a session with `metorialDeepseek`.
// This adapter is similar to `metorialOpenAI` but tuned for DeepSeek's function calling behavior.
let deployment = await metorial.providerDeployments.create({
  name: 'Metorial Search',
  providerId: 'metorial-search'
});

await metorial.withProviderSession(
  metorialDeepseek,
  { providers: [{ providerDeploymentId: deployment.id }] },
  async session => {
    // Tools are deduplicated by function name since some providers may expose overlapping names.
    let uniqueTools = Array.from(
      new Map(session.tools.map(t => [t.function.name, t])).values()
    );

    // The tool call loop follows the same pattern as OpenAI — check `tool_calls`, execute
    // via `session.callTools()`, append to history.
    for (let i = 0; i < 10; i++) {
      let response = await deepseek.chat.completions.create({
        model: 'deepseek-chat',
        messages,
        tools: uniqueTools
      });

      let choice = response.choices[0]!;
      let toolCalls = choice.message.tool_calls;

      if (!toolCalls || toolCalls.length === 0) {
        console.log(choice.message.content);
        return;
      }

      let toolResponses = await session.callTools(toolCalls);
      messages.push({ role: 'assistant', tool_calls: toolCalls }, ...toolResponses);
    }
  }
);
```

## Adding OAuth providers

Uncomment the OAuth section in `src/index.ts` to add providers like GitHub or Slack. See the [main README](../../README.md#oauth-flow) for details.
