# Metorial Quick Start

The simplest way to try [Metorial](https://metorial.com). Uses the [Vercel AI SDK](https://sdk.vercel.ai/) with Anthropic Claude to search the web via Metorial's built-in **Metorial Search** provider — no dashboard setup needed.

## Environment variables

- `METORIAL_API_KEY` — get one at [platform.metorial.com](https://platform.metorial.com)
- `ANTHROPIC_API_KEY` — from [console.anthropic.com](https://console.anthropic.com)

## Run

```bash
bun install
bun start
```

## How it works

```typescript
import { anthropic } from '@ai-sdk/anthropic';
import { metorialAiSdk } from '@metorial/ai-sdk';
import { Metorial } from 'metorial';
import { stepCountIs, streamText } from 'ai';

// Initialize the Metorial client and create a deployment for the built-in web search provider.
// `metorial-search` is a special provider slug that works out of the box — no dashboard
// configuration needed.
let metorial = new Metorial({ apiKey: process.env.METORIAL_API_KEY! });

let deployment = await metorial.providerDeployments.create({
  name: 'Metorial Search',
  providerId: 'metorial-search'
});

// Open a streaming session. `withProviderSession` connects to Metorial's MCP servers and
// provides `tools` formatted for the AI SDK. The `streaming: true` flag keeps the connection
// alive for the duration of the stream.
let result = await metorial.withProviderSession(
  metorialAiSdk,
  {
    providers: [{ providerDeploymentId: deployment.id }],
    streaming: true
  },
  async ({ tools, closeSession }) => {
    // Call `streamText()` from the Vercel AI SDK. The AI SDK handles the tool call loop
    // automatically — when Claude wants to search the web, it calls the MCP tools, gets
    // results, and continues generating. `stepCountIs(10)` limits the number of tool call rounds.
    let result = streamText({
      model: anthropic('claude-sonnet-4-20250514'),
      prompt:
        'Search the web for the latest news about AI agents and summarize the top 3 stories.',
      stopWhen: stepCountIs(10),
      tools,
      onStepFinish: step => {
        if (step.toolCalls?.length) {
          console.log(`\n🔧 ${step.toolCalls.map(tc => tc.toolName).join(', ')}\n`);
        }
      },
      onFinish: async () => {
        await closeSession();
      }
    });
    return result;
  }
);

// Stream the text to stdout as it arrives.
for await (let part of result.textStream) {
  process.stdout.write(part);
}
```

## Adding more providers

To add providers like GitHub or Slack that require OAuth, see the commented-out OAuth section in the [`typescript-ai-sdk`](../typescript-ai-sdk/) example, or the [main README](../../README.md#authenticating-mcp-tool-providers) for full auth docs.
