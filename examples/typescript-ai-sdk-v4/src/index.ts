import { openai } from '@ai-sdk/openai';
import { metorialAiSdk } from '@metorial/ai-sdk/v4';
import Metorial from 'metorial';
import { streamText, stepCountIs } from 'ai';

let metorial = new Metorial({
  apiKey: process.env.METORIAL_API_KEY!,
});

// To use a different provider (e.g. GitHub, Slack), create a deployment at https://platform.metorial.com
let deployment = await metorial.providerDeployments.create({
  name: 'Metorial Search',
  providerId: 'metorial-search'
});


let session = await metorial.connect({
  adapter: metorialAiSdk(),
  providers: [
    { providerDeploymentId: deployment.id },
  ]
});

let result = streamText({
  model: openai('gpt-4o-mini'),
  prompt: 'Search the web for the latest news about AI agents and summarize the top 3 stories.',
  stopWhen: stepCountIs(10),
  tools: session.tools(),
  onStepFinish: (step) => {
    if (step.toolCalls?.length) {
      console.log(`\n🔧 ${step.toolCalls.map((tc) => tc.toolName).join(', ')}\n`);
    }
  }
});

for await (let part of result.textStream) {
  process.stdout.write(part);
}
