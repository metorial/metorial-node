# Metorial + AI SDK v4 Example

Shows how to use Metorial tools with Vercel AI SDK v4 and OpenAI.

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
import { metorialAiSdk } from '@metorial/ai-sdk/v4';
import { Metorial } from '@metorial/sdk';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

let metorial = new Metorial({ apiKey: 'your-key' });

metorial.withProviderSession(
  metorialAiSdk,
  { serverDeployments: ['your-deployment'] },
  async session => {
    let result = await generateText({
      model: openai('gpt-3.5-turbo'),
      prompt: 'Your prompt here',
      maxSteps: 10,
      tools: session.tools
    });
    console.log(result.text);
  }
);
```

Here's what happens:

- The Metorial session is initialized with tool bindings from `@metorial/ai-sdk/v4`.
- `generateText()` runs a prompt with tool support enabled.
- If the model chooses to invoke a tool, Metorial handles the call and feeds the response back.
- The session continues until a final, tool-free answer is returned or `maxSteps` is reached.

## License

MIT — feel free to use, fork, or adapt this example in your own applications.

## Learn More

- [Metorial Documentation](https://metorial.com/docs)
- [Vercel AI SDK](https://ai-sdk.dev/)
