# Metorial + Mistral

Uses the [Mistral SDK](https://docs.mistral.ai/) with [Metorial](https://metorial.com) MCP tools. Includes a workaround for Mistral's strict JSON schema requirements.

## Environment variables

- `METORIAL_API_KEY` — get one at [platform.metorial.com](https://platform.metorial.com)
- `MISTRAL_API_KEY` — from [console.mistral.ai](https://console.mistral.ai/)

## Run

```bash
bun install
METORIAL_API_KEY=... MISTRAL_API_KEY=... bun start
```

## How it works

Initialize clients and create a Metorial Search deployment:

```typescript
import { metorialMistral } from "@metorial/mistral";
import { Metorial } from "metorial";
import { Mistral } from "@mistralai/mistralai";

let metorial = new Metorial({ apiKey: process.env.METORIAL_API_KEY! });
let mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY! });

let deployment = await metorial.providerDeployments.create({
  name: "Metorial Search",
  providerId: "metorial-search",
});
```

Mistral requires `additionalProperties: false` on all object schemas in tool definitions, or it rejects the request. This code patches each tool's parameters before passing them to the API — other LLMs don't need this:

```typescript
    let fixedTools = session.tools.map((tool) => {
      if (tool.function?.parameters) {
        let fixedParams = { ...tool.function.parameters };
        fixedParams.additionalProperties = false;

        if (fixedParams.properties) {
          Object.values(fixedParams.properties).forEach((prop: any) => {
            if (prop && typeof prop === "object" && prop.type === "object") {
              prop.additionalProperties = false;
            }
          });
        }

        return { ...tool, function: { ...tool.function, parameters: fixedParams } };
      }
      return tool;
    });
```

The tool call loop uses `mistral.chat.complete()` instead of OpenAI's `chat.completions.create()`. Note the Mistral-specific differences: tool calls are at `choice.message.toolCalls` (camelCase, not `tool_calls`), and the assistant message format uses `{ role: "assistant", toolCalls }`:

```typescript
    for (let i = 0; i < 10; i++) {
      let response = await mistral.chat.complete({
        model: "mistral-large-latest",
        messages,
        tools: fixedTools,
      });

      let choice = response.choices[0]!;
      let toolCalls = choice.message.toolCalls;

      if (!toolCalls || toolCalls.length === 0) {
        console.log(choice.message.content);
        return;
      }

      let toolResponses = await session.callTools(toolCalls);
      messages.push(
        { role: "assistant" as const, toolCalls },
        ...toolResponses
      );
    }
```

## Adding OAuth providers

Uncomment the OAuth section in `src/index.ts` to add providers like GitHub or Slack. See the [main README](../../README.md#oauth-flow) for details.
