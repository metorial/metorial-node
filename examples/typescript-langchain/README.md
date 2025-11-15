# Metorial + LangChain v4 Example

Shows how to use Metorial tools with Vercel LangChain v4 and OpenAI.

## Setup

1. **Install**: `bun install`

2. **API Keys**: Set in `.env`:

```env
OPENAI_API_KEY=your-key-here
```

3. **Configure**: Update `src/index.ts` with your Metorial API key and server deployment ID

4. **Run**: `bun start` for development

## Code

```ts
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

Here's what happens:

- The Metorial session is initialized with tool bindings from `@metorial/langchain`.
- `createAgent()` Passes the tools from the MCP server on Metorial to LangChain.
- `agent.invoke()` Starts the agent interaction.
- If the model chooses to invoke a tool, Metorial handles the call and feeds the response back.

## License

MIT — feel free to use, fork, or adapt this example in your own applications.

## Learn More

- [Metorial Documentation](https://metorial.com/docs)
- [LangChain Documentation](https://docs.langchain.com/)
