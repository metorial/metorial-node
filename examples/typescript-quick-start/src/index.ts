import { anthropic } from '@ai-sdk/anthropic';
import { metorialAiSdk } from '@metorial/ai-sdk';
import { Metorial } from 'metorial';
import { stepCountIs, streamText } from 'ai';

let metorial = new Metorial({ apiKey: process.env.METORIAL_API_KEY! });

// Create a deployment for Metorial Search — built-in web search, no auth needed
let deployment = await metorial.providerDeployments.create({
  name: 'Metorial Search',
  providerId: 'metorial-search'
});

let result = await metorial.withProviderSession(
  metorialAiSdk,
  {
    providers: [{ providerDeploymentId: deployment.id }],
    streaming: true
  },
  async ({ tools, closeSession }) => {
    let result = streamText({
      model: anthropic('claude-sonnet-4-20250514'),
      prompt:
        'Search the web for the latest news about AI agents and summarize the top 3 stories.',
      stopWhen: stepCountIs(10),
      tools,
      onStepFinish: (step) => {
        if (step.toolCalls?.length) {
          console.log(`\n🔧 ${step.toolCalls.map((tc) => tc.toolName).join(', ')}\n`);
        }
      },
      onFinish: async () => {
        await closeSession();
      }
    });
    return result;
  }
);

for await (let part of result.textStream) {
  process.stdout.write(part);
}
