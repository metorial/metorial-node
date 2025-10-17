# Metorial + AI SDK v5 Example

Shows how to use Metorial tools with Vercel AI SDK v5 and Anthropic Claude.

## Setup

1. **Install**: `bun install`

2. **API Keys**: Set in `.env`:
```env
ANTHROPIC_API_KEY=your-key-here
```

3. **Configure**: Update `src/index.ts` with your Metorial API key and server deployment ID

4. **Run**: `bun start` for development

## Code

```ts
import { anthropic } from '@ai-sdk/anthropic';
import { metorialAiSdk } from '@metorial/ai-sdk';
import { Metorial } from '@metorial/sdk';
import { generateText, stepCountIs } from 'ai';

globalThis.AI_SDK_DEFAULT_PROVIDER = anthropic;

let metorial = new Metorial({ apiKey: 'your-key' });

metorial.withProviderSession(
  metorialAiSdk,
  { serverDeployments: ['your-deployment'] },
  async session => {
    let result = await generateText({
      model: 'claude-3-haiku-20240307',
      prompt: 'Your prompt here',
      stopWhen: stepCountIs(10),
      tools: session.tools
    });
    console.log(result.text);
  }
);
```

Here’s what happens:

* The Metorial session is initialized with tool bindings from `@metorial/ai-sdk`.
* `generateText()` runs a prompt with tool support enabled.
* If the model chooses to invoke a tool, Metorial handles the call and feeds the response back.
* The session continues until a final, tool-free answer is returned or `stopWhen` is reached.

> 🧠 This pattern allows AI models to reason through tasks by calling real tools, like APIs or internal services you've registered with Metorial.

## Requirements

* Bun (or Node-compatible runtime)
* OpenAI API access with GPT-4o
* A Metorial account and server deployment ID

## License

MIT — feel free to use, fork, or adapt this example in your own applications.

## Learn More

* [Metorial Documentation](https://metorial.com/docs)
* [Vercel AI SDK](https://ai-sdk.dev/)