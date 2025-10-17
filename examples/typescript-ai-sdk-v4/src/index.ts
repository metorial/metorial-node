import { metorialAiSdk } from '@metorial/ai-sdk/v4';
import { Metorial } from '@metorial/sdk';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

let metorial = new Metorial({ apiKey: '...your-metorial-api-key...' });

metorial.withProviderSession(
  metorialAiSdk,
  {
    serverDeployments: ['...your-server-deployment-id...']
  },
  async session => {
    let result = await generateText({
      model: openai('gpt-3.5-turbo'),
      prompt: 'Research what makes Metorial so special.',
      maxSteps: 10,
      tools: session.tools
    });

    console.log(result.text);
  }
);
