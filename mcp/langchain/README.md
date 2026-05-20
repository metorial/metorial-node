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
import { createAgent } from 'langchain';
import Metorial from 'metorial';

let metorial = new Metorial({ apiKey: 'your-metorial-api-key' });

let deployment = await metorial.providerDeployments.create({
  name: 'My Provider',
  providerId: 'your-provider-id'
});

let session = await metorial.connect({
  adapter: metorialLangchain(),
  providers: [{ providerDeploymentId: deployment.id }]
});

console.log('Session tools:', session.tools());

let agent = createAgent({
  model: new ChatOpenAI({ model: 'gpt-4o' }),
  tools: session.tools()
});

let result = await agent.invoke({
  messages: [{ role: 'user', content: 'What are the top stories on HackerNews?' }]
});

console.log('Result:', JSON.stringify(result, null, 2));
```

## License

MIT License - see [LICENSE](../../LICENSE) file for details.
