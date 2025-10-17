import { anthropic } from '@ai-sdk/anthropic';
import { metorialAiSdk } from '@metorial/ai-sdk';
import { Metorial } from '@metorial/sdk';
import { generateText, stepCountIs } from 'ai';

// Set global provider with API key in .env
globalThis.AI_SDK_DEFAULT_PROVIDER = anthropic;

let metorial = new Metorial({ apiKey: '...your-metorial-api-key...' });

metorial.withProviderSession(
  metorialAiSdk,
  {
    serverDeployments: ['...your-server-deployment-id...']
  },
  async session => {
    let result = await generateText({
      model: 'claude-3-haiku-20240307',
      prompt: 'Research what makes Metorial so special.',
      stopWhen: stepCountIs(10),
      tools: session.tools
    });

    console.log(result.text);
  }
);
