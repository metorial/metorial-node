# @metorial/deepseek

DeepSeek provider integration for Metorial - enables using Metorial tools with DeepSeek's language models through function calling.

## Installation

```bash
npm install @metorial/deepseek
# or
yarn add @metorial/deepseek
# or
pnpm add @metorial/deepseek
# or
bun add @metorial/deepseek
```

## Usage

```typescript
import { metorialDeepSeek } from '@metorial/deepseek';
import { Metorial } from 'metorial';
import OpenAI from 'openai';

let metorial = new Metorial({
  apiKey: 'your-metorial-api-key'
});

let deepseek = new OpenAI({
  apiKey: 'your-deepseek-api-key',
  baseURL: 'https://api.deepseek.com'
});

await metorial.withProviderSession(
  metorialDeepSeek,
  {
    serverDeployments: ['your-server-deployment-id']
  },
  async session => {
    let messages = [
      {
        role: 'user',
        content:
          'Summarize the README.md file of the metorial/websocket-explorer repository on GitHub?'
      }
    ];

    for (let i = 0; i < 10; i++) {
      let response = await deepseek.chat.completions.create({
        model: 'deepseek-chat',
        messages,
        tools: session.tools
      });

      let choice = response.choices[0]!;
      let toolCalls = choice.message.tool_calls;

      if (!toolCalls) {
        console.log(choice.message.content);
        return;
      }

      let toolResponses = await session.callTools(toolCalls);

      messages.push(
        {
          role: 'assistant',
          tool_calls: choice.message.tool_calls
        },
        ...toolResponses
      );
    }
  }
);
```

## License

MIT License - see [LICENSE](../../LICENSE) file for details.
