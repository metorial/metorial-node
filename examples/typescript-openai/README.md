# Metorial + OpenAI

Uses the [OpenAI SDK](https://platform.openai.com/docs) with [Metorial](https://metorial.com) MCP tools. Shows the manual tool call loop for OpenAI's chat completions API with GPT-4o.

## Environment variables

- `METORIAL_API_KEY` — get one at [platform.metorial.com](https://platform.metorial.com)
- `OPENAI_API_KEY` — from [platform.openai.com](https://platform.openai.com)

## Run

```bash
bun install
bun start
```

## How it works

```typescript
import { metorialOpenAI } from '@metorial/openai';
import { Metorial } from 'metorial';
import OpenAI from 'openai';

// Initialize clients and create a Metorial Search deployment.
let metorial = new Metorial({ apiKey: process.env.METORIAL_API_KEY! });
let openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

let deployment = await metorial.providerDeployments.create({
  name: 'Metorial Search',
  providerId: 'metorial-search'
});

// Open a session with `metorialOpenAI.chatCompletions`, which formats MCP tools in OpenAI's
// function calling format. Note the `.chatCompletions` — this tells the adapter to produce
// tools shaped for the chat completions API.
await metorial.withProviderSession(
  metorialOpenAI.chatCompletions,
  { providers: [{ providerDeploymentId: deployment.id }] },
  async session => {
    // Tool call loop: send messages to GPT-4o with `session.tools`, check for `tool_calls`
    // in the response, execute them via `session.callTools()`, and append everything to the
    // message history. When the model responds without tool calls, print the result.
    for (let i = 0; i < 10; i++) {
      let response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages,
        tools: session.tools
      });
      let choice = response.choices[0]!;
      let toolCalls = choice.message.tool_calls;

      if (!toolCalls) {
        console.log(choice.message.content);
        return;
      }

      // OpenAI tool responses are spread into the messages array (`...toolResponses`) because
      // each tool result is a separate message, unlike Anthropic where they're bundled.
      let toolResponses = await session.callTools(toolCalls);
      messages.push(
        { role: 'assistant', tool_calls: choice.message.tool_calls },
        ...toolResponses
      );
    }
  }
);
```

## Adding OAuth providers

Uncomment the OAuth section in `src/index.ts` to add providers like GitHub or Slack. See the [main README](../../README.md#oauth-flow) for details.
