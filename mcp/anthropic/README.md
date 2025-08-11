# @metorial/anthropic

Anthropic provider integration for Metorial - enables using Metorial tools with Anthropic's NLP models.

## Installation

```bash
npm install @metorial/anthropic
# or
yarn add @metorial/anthropic
# or
pnpm add @metorial/anthropic
# or
bun add @metorial/anthropic
```

## Usage

```typescript
import { metorialAnthropic } from '@metorial/anthropic';
import { Metorial } from 'metorial';
import OpenAI from 'openai';

let metorial = new Metorial({
  apiKey: 'your-metorial-api-key'
});

let anthropic = new OpenAI({
  apiKey: 'your-anthropic-api-key',
  baseURL: 'https://api.anthropic.com/v1'
});

await metorial.withProviderSession(
  metorialAnthropic,
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

    let response = await anthropic.chat.completions.create({
      model: 'claude-3-5-sonnet-20241022',
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
