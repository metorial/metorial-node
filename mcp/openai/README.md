# @metorial/openai

OpenAI provider integration for Metorial - enables using Metorial tools with OpenAI's GPT models through function calling.

## Installation

```bash
npm install @metorial/openai
# or
yarn add @metorial/openai
# or
pnpm add @metorial/openai
# or
bun add @metorial/openai
```

## Features

- 🔧 **OpenAI Function Calling**: Full support for OpenAI's function calling API
- 🚀 **GPT Model Support**: Works with GPT-4, GPT-3.5, and other OpenAI models
- 📡 **Session Management**: Automatic tool lifecycle handling
- 🛠️ **Tool Discovery**: Automatic tool detection and formatting
- 🔄 **Format Conversion**: Converts Metorial tools to OpenAI function format
- ✅ **Strict Mode**: Optional strict parameter validation

## Usage

### Basic Usage

```typescript
import { Metorial } from 'metorial';
import { metorialOpenAI } from '@metorial/openai';
import OpenAI from 'openai';

const metorial = new Metorial({
  apiKey: 'your-metorial-api-key'
});

const openai = new OpenAI({ 
  apiKey: 'your-openai-api-key' 
});

await metorial.withProviderSession(
  metorialOpenAI.chatCompletions,
  { serverDeployments: ['your-server-deployment-id'] },
  async session => {
    const messages = [
      { role: 'user', content: 'What are the latest commits?' }
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      tools: session.tools
    });

    // Handle tool calls
    const toolCalls = response.choices[0]?.message.tool_calls;
    if (toolCalls) {
      const toolResponses = await session.callTools(toolCalls);
      messages.push(
        { role: 'assistant', tool_calls: toolCalls },
        ...toolResponses
      );
    }
  }
);
```

### OpenAI Responses API

For the OpenAI Responses API (beta):

```typescript
import { metorialOpenAI } from '@metorial/openai';

await metorial.withProviderSession(
  metorialOpenAI.responses,
  { serverDeployments: ['your-deployment-id'] },
  async session => {
    // Use session.tools with OpenAI Responses API
    // Tools are formatted for the responses endpoint
  }
);
```

## API Reference

### `metorialOpenAI.chatCompletions`

Provider for OpenAI's Chat Completions API with function calling support.

### `metorialOpenAI.responses`

Provider for OpenAI's Responses API (beta) with strict function definitions.

## Peer Dependencies

This package requires `openai` as a peer dependency:

```json
{
  "peerDependencies": {
    "openai": "*"
  }
}
```

## License

MIT License - see [LICENSE](../../LICENSE) file for details.
