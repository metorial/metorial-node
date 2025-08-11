# @metorial/openai-compatible

OpenAI-compatible provider base for Metorial. Provides common functionality for OpenAI-compatible API providers.

## Installation

```bash
npm install @metorial/openai-compatible
# or
yarn add @metorial/openai-compatible
# or
pnpm add @metorial/openai-compatible
# or
bun add @metorial/openai-compatible
```

## Usage

This package provides a factory function to create OpenAI-compatible MCP SDKs for any OpenAI-compatible API.

```typescript
import { createOpenAICompatibleMcpSdk } from '@metorial/openai-compatible';
import { Metorial } from 'metorial';
import OpenAI from 'openai';

let metorial = new Metorial({
  apiKey: 'your-metorial-api-key'
});

// Create an OpenAI-compatible provider
let metorialOpenAICompatible = createOpenAICompatibleMcpSdk({});

await metorial.withProviderSession(
  metorialOpenAICompatible,
  {
    serverDeployments: ['your-server-deployment-id']
  },
  async session => {
    // Use any OpenAI-compatible client
    let openai = new OpenAI({
      apiKey: 'your-openai-api-key'
    });

    let messages = [
      {
        role: 'user',
        content:
          'Summarize the README.md file of the metorial/websocket-explorer repository on GitHub?'
      }
    ];

    let response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      tools: session.tools
    });

    let choice = response.choices[0]!;
    let toolCalls = choice.message.tool_calls;

    if (toolCalls && toolCalls.length > 0) {
      let toolResponses = await session.callTools(toolCalls);
      console.log('Tool responses:', toolResponses);
    } else {
      console.log(choice.message.content);
    }
  }
);
```

## Dependencies

- `@metorial/core`: Core Metorial functionality
- `@metorial/mcp-sdk-utils`: MCP SDK utilities
- `@metorial/mcp-session`: MCP session management
- `@metorial/sdk`: Main SDK

## License

MIT License - see [LICENSE](../../LICENSE) file for details.
