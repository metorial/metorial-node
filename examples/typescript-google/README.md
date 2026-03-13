# Metorial + Google Gemini

Uses the [Google GenAI SDK](https://ai.google.dev/) with [Metorial](https://metorial.com) MCP tools. Shows how Gemini's function calling works with MCP tools.

## Environment variables

- `METORIAL_API_KEY` — get one at [platform.metorial.com](https://platform.metorial.com)
- `GOOGLE_API_KEY` — from [ai.google.dev](https://ai.google.dev/)

## Run

```bash
bun install
bun start
```

## How it works

```typescript
import { metorialGoogle } from '@metorial/google';
import { Metorial } from 'metorial';
import { GoogleGenAI } from '@google/genai';

// Initialize clients and create a Metorial Search deployment.
let metorial = new Metorial({ apiKey: process.env.METORIAL_API_KEY! });
let genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! });

let deployment = await metorial.providerDeployments.create({
  name: 'Metorial Search',
  providerId: 'metorial-search'
});

// Open a session with `metorialGoogle`, which formats MCP tools as Gemini function declarations.
// Gemini expects tools in the `config.tools` field.
await metorial.withProviderSession(
  metorialGoogle,
  { providers: [{ providerDeploymentId: deployment.id }] },
  async session => {
    let response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: 'Search the web for the latest news about AI agents...' }]
        }
      ],
      config: {
        tools: session.tools
      }
    });

    // Gemini returns function calls as `functionCall` parts inside `response.candidates`.
    // Extract them and execute via `session.callTools()`.
    let functionCalls = response.candidates?.[0]?.content?.parts
      ?.filter(part => part.functionCall)
      .map(part => part.functionCall!);

    if (functionCalls && functionCalls.length > 0) {
      let toolResponses = await session.callTools(functionCalls);
      console.log('Tool responses:', toolResponses);
    }

    // Note: this example does a single round of tool calls. For a full multi-turn loop
    // (like the Anthropic/OpenAI examples), you'd feed the tool results back into `contents`
    // and call `generateContent` again.
  }
);
```

## Adding OAuth providers

Uncomment the OAuth section in `src/index.ts` to add providers like GitHub or Slack. See the [main README](../../README.md#oauth-flow) for details.
