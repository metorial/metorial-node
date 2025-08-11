# @metorial/xai

XAI (Grok) provider integration for Metorial - enables using Metorial tools with XAI's Grok models through function calling.

## Installation

```bash
npm install @metorial/xai
# or
yarn add @metorial/xai
# or
pnpm add @metorial/xai
# or
bun add @metorial/xai
```

## Usage

```typescript
import { metorialXAI } from '@metorial/xai';
import { Metorial } from 'metorial';
import OpenAI from 'openai';

let metorial = new Metorial({
  apiKey: 'your-metorial-api-key'
});

let xai = new OpenAI({
  apiKey: 'your-xai-api-key',
  baseURL: 'https://api.x.ai/v1'
});

await metorial.withProviderSession(
  metorialXAI,
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

    let response = await xai.chat.completions.create({
      model: 'grok-beta',
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

## License

MIT License - see [LICENSE](../../LICENSE) file for details.
