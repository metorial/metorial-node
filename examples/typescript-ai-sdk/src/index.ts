import { anthropic } from '@ai-sdk/anthropic';
import { metorialAiSdk } from '@metorial/ai-sdk';
import { Metorial } from '@metorial/sdk';
import { stepCountIs, streamText } from 'ai';

let metorial = new Metorial({ apiKey: '...metorial-api-key...' });

metorial.withProviderSession(
  metorialAiSdk,
  {
    serverDeployments: ['...your-server-deployment-id...']
  },
  async session => {
    let { textStream } = streamText({
      model: anthropic('claude-sonnet-4-5'),
      prompt: 'Research what makes Metorial so special.',
      stopWhen: stepCountIs(25),
      tools: session.tools
    });

    for await (let textPart of textStream) {
      console.log(textPart);
    }
  }
);
