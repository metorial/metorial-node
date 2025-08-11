# @metorial/ai-sdk

AI SDK integration for Metorial - provides compatibility with Vercel's AI SDK for streamlined tool usage.

## Installation

```bash
npm install @metorial/ai-sdk
# or
yarn add @metorial/ai-sdk
# or
pnpm add @metorial/ai-sdk
# or
bun add @metorial/ai-sdk
```

## Usage

```typescript
import { metorialAISDK } from '@metorial/ai-sdk';
import { Metorial } from 'metorial';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

let metorial = new Metorial({
  apiKey: 'your-metorial-api-key'
});

await metorial.withProviderSession(
  metorialAISDK,
  {
    serverDeployments: ['your-server-deployment-id']
  },
  async session => {
    let { text } = await generateText({
      model: openai('gpt-4o'),
      prompt:
        'Summarize the README.md file of the metorial/websocket-explorer repository on GitHub.',
      tools: session.tools
    });

    console.log('Generated text:', text);
  }
);
```

## License

MIT License - see [LICENSE](../../LICENSE) file for details.
