# @metorial/togetherai

Together AI provider integration for Metorial - enables using Metorial tools with Together AI's language models through function calling.

## Installation

```bash
npm install @metorial/togetherai
# or
yarn add @metorial/togetherai
# or
pnpm add @metorial/togetherai
# or
bun add @metorial/togetherai
```

## Features

- 🤖 **Together AI Integration**: Full support for Together AI models
- 🛠️ **Function Calling**: Native function calling support
- 📡 **Session Management**: Automatic tool lifecycle handling
- 🔄 **OpenAI Compatibility**: Based on OpenAI-compatible interface
- ⚡ **TypeScript Support**: Full TypeScript support with comprehensive type definitions

## Usage

```typescript
import { metorialTogetherAi } from '@metorial/togetherai';
import Metorial from 'metorial';
import OpenAI from 'openai';

let metorial = new Metorial({
  apiKey: 'your-metorial-api-key'
});

let togetherai = new OpenAI({
  apiKey: 'your-togetherai-api-key',
  baseURL: 'https://api.together.xyz/v1'
});

let session = await metorial.connect({
  adapter: metorialTogetherAi(),
  providers: [{ providerDeploymentId: 'your-provider-deployment-id' }]
});

let messages = [
  {
    role: 'user',
    content:
      'Summarize the README.md file of the metorial/websocket-explorer repository on GitHub?'
  }
];

let response = await togetherai.chat.completions.create({
  model: 'Qwen/Qwen3.5-397B-A17B',
  messages,
  tools: session.tools()
});

let choice = response.choices[0]!;
let toolCalls = choice.message.tool_calls;

if (toolCalls && toolCalls.length > 0) {
  let toolResponses = await session.callTools(toolCalls);
  console.log('Tool responses:', toolResponses);
} else {
  console.log(choice.message.content);
}
```

## Dependencies

- `@metorial/core`: Core Metorial functionality
- `@metorial/mcp-sdk-utils`: MCP SDK utilities
- `@metorial/mcp-session`: MCP session management
- `@metorial/openai-compatible`: OpenAI-compatible base functionality
- `@metorial/sdk`: Main SDK

## Peer Dependencies

This package requires an OpenAI-compatible client for Together AI:

```json
{
  "peerDependencies": {
    "openai": "*"
  }
}
```

## License

MIT License - see [LICENSE](../../LICENSE) file for details.
