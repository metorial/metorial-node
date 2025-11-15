# @metorial/langchain

LangChain integration for Metorial - provides compatibility with LangChain for streamlined tool usage.

## Installation

```bash
npm install @metorial/langchain
# or
yarn add @metorial/langchain
# or
pnpm add @metorial/langchain
# or
bun add @metorial/langchain
```

## Usage

```typescript
import { ChatOpenAI } from '@langchain/openai';
import { metorialLangchain } from '@metorial/langchain';
import { Metorial } from '@metorial/sdk';
import { createAgent } from 'langchain';

let metorial = new Metorial({ apiKey: 'your-metorial-api-key' });

metorial.withProviderSession(
  metorialLangchain,
  {
    serverDeployments: ['your-server-deployment-id']
  },
  async session => {
    console.log('Session tools:', session.tools);

    let agent = createAgent({
      model: new ChatOpenAI({ model: 'gpt-5' }),
      tools: session.tools
    });

    let result = await agent.invoke({
      messages: [{ role: 'user', content: 'What are the top stories on HackerNews?' }]
    });

    console.log('Result:', JSON.stringify(result, null, 2));
  }
);
```

## License

MIT License - see [LICENSE](../../LICENSE) file for details.
