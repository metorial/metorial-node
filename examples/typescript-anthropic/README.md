# Metorial + Anthropic SDK

Uses the raw [Anthropic SDK](https://docs.anthropic.com/en/docs/sdks) with [Metorial](https://metorial.com) MCP tools. Unlike the AI SDK examples where tool calling is automatic, this shows the **manual tool call loop** you need when using the Anthropic SDK directly.

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
import { metorialAnthropic } from '@metorial/anthropic';
import { Metorial } from 'metorial';
import Anthropic from '@anthropic-ai/sdk';

// Initialize both clients and create a Metorial Search deployment.
let metorial = new Metorial({ apiKey: process.env.METORIAL_API_KEY! });
let anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

let deployment = await metorial.providerDeployments.create({
  name: 'Metorial Search',
  providerId: 'metorial-search'
});

// Open a session with `metorialAnthropic`, which formats MCP tools in Claude's native tool
// format. The session callback receives `session.tools` (tool definitions) and
// `session.callTools()` (to execute tool calls).
await metorial.withProviderSession(
  metorialAnthropic,
  { providers: [{ providerDeploymentId: deployment.id }] },
  async session => {
    // Some MCP providers expose overlapping tool names, so deduplicate by name.
    let uniqueTools = Array.from(new Map(session.tools.map(t => [t.name, t])).values());

    // Multi-turn tool call loop. Each iteration sends the conversation to Claude with the
    // available tools, checks if Claude wants to call any tools, and if so, executes them
    // via `session.callTools()` and appends the results to the message history. When Claude
    // responds without tool calls, we print the final text.
    for (let i = 0; i < 10; i++) {
      let response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages,
        tools: uniqueTools
      });

      let toolCalls = response.content.filter(
        (c): c is Anthropic.Messages.ToolUseBlock => c.type === 'tool_use'
      );

      if (toolCalls.length === 0) {
        // No tool calls — print the final text response
        let finalText = response.content
          .filter((c): c is Anthropic.Messages.TextBlock => c.type === 'text')
          .map(c => c.text)
          .join('');
        console.log(finalText);
        return;
      }

      // Execute the tool calls and add results to the conversation
      let toolResponses = await session.callTools(toolCalls);
      messages.push({ role: 'assistant', content: response.content as any }, toolResponses);
    }
  }
);
```

## Adding OAuth providers

Uncomment the OAuth section in `src/index.ts` to add providers like GitHub or Slack alongside Metorial Search. See the [main README](../../README.md#oauth-flow) for details.
