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

## Usage

### Basic Usage

```typescript
import { Metorial } from 'metorial';
import { metorialOpenAI } from '@metorial/openai';
import OpenAI from 'openai';

let metorial = new Metorial({
  apiKey: 'your-metorial-api-key'
});

let openai = new OpenAI({
  apiKey: 'your-openai-api-key'
});

await metorial.withProviderSession(
  metorialOpenAI.chatCompletions,
  { serverDeployments: ['your-server-deployment-id'] },
  async session => {
    let messages = [{ role: 'user', content: 'What are the latest commits?' }];

    let response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      tools: session.tools
    });

    // Handle tool calls
    let toolCalls = response.choices[0]?.message.tool_calls;
    if (toolCalls) {
      let toolResponses = await session.callTools(toolCalls);
      messages.push({ role: 'assistant', tool_calls: toolCalls }, ...toolResponses);
    }
  }
);
```

## License

MIT License - see [LICENSE](../../LICENSE) file for details.
