# Metorial + LangChain

Uses [LangChain](https://js.langchain.com/) with [LangGraph](https://langchain-ai.github.io/langgraphjs/) and Anthropic Claude to run a ReAct agent with [Metorial](https://metorial.com) MCP tools.

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
import { metorialLangchain } from '@metorial/langchain';
import { ChatAnthropic } from '@langchain/anthropic';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { Metorial } from 'metorial';

let metorial = new Metorial({ apiKey: process.env.METORIAL_API_KEY! });

// Create a deployment for Metorial Search — built-in web search, no auth needed.
let deployment = await metorial.providerDeployments.create({
  name: 'Metorial Search',
  providerId: 'metorial-search'
});

// Open a session with `metorialLangchain`, which formats MCP tools as LangChain
// StructuredTool objects. These are compatible with LangGraph's createReactAgent.
await metorial.withProviderSession(
  metorialLangchain,
  { providers: [{ providerDeploymentId: deployment.id }] },
  async ({ tools }) => {
    let llm = new ChatAnthropic({
      model: 'claude-sonnet-4-20250514',
      apiKey: process.env.ANTHROPIC_API_KEY!
    });

    // Dedupe tools by name — some MCP providers may expose overlapping tool names.
    let uniqueTools = Array.from(new Map(tools.map(t => [t.name, t])).values());

    // createReactAgent builds a LangGraph agent that automatically handles the
    // tool call loop — it calls tools, feeds results back, and repeats until done.
    let agent = createReactAgent({ llm, tools: uniqueTools });

    // Stream the agent's output. The 'agent' events contain the model's messages.
    let stream = await agent.stream({
      messages: [{ role: 'user', content: 'Search the web for the latest AI news.' }]
    });

    for await (let event of stream) {
      if ('agent' in event) {
        let msg = event.agent.messages[event.agent.messages.length - 1];
        if (msg && 'content' in msg && typeof msg.content === 'string') {
          console.log(msg.content);
        }
      }
    }
  }
);
```

## Adding OAuth providers

Uncomment the OAuth section in `src/index.ts` to add providers like GitHub or Slack. See the [main README](../../README.md#oauth-flow) for details.
