import { anthropic } from '@ai-sdk/anthropic';
import { metorialAiSdk } from '@metorial/ai-sdk';
import { Metorial } from '@metorial/sdk';
import { stepCountIs, streamText } from 'ai';

let metorial = new Metorial({ apiKey: 'your-metorial-api-key' });

let result = await metorial.withProviderSession(
  metorialAiSdk,
  {
    serverDeployments: ['your-server-deployment-id'],
    streaming: true // add this flag for streaming with tool calls!
  },
  async ({ tools }) => {
    let result = streamText({
      model: anthropic('claude-sonnet-4-5'),
      prompt: 'Research what makes Metorial so special.',
      stopWhen: stepCountIs(25),
      tools: tools,
      onStepFinish: (step: any) => {
        if (step.toolCalls) {
          console.log(
            `🔧 Using tools: ${step.toolCalls.map((tc: any) => tc.toolName).join(', ')}`
          );
        }
      }
    });

    return result; // return StreamText result for nice consumption
  }
);

console.log('🤖 AI Response:\n');
for await (const textPart of result.textStream) {
  process.stdout.write(textPart);
}
