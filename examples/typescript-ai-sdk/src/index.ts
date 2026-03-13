import { anthropic } from '@ai-sdk/anthropic';
import { metorialAiSdk } from '@metorial/ai-sdk';
import { Metorial } from 'metorial';
import { streamText, stepCountIs } from 'ai';

let metorial = new Metorial({
  apiKey: process.env.METORIAL_API_KEY!
});

// Create a deployment for Metorial Search — built-in web search, no auth needed.
// To use a different provider (e.g. GitHub, Slack), create a deployment at
// https://platform.metorial.com and replace this with:
//   let providerDeploymentId = process.env.PROVIDER_DEPLOYMENT_ID!;
let deployment = await metorial.providerDeployments.create({
  name: 'Metorial Search',
  providerId: 'metorial-search'
});

// ── (Optional) Setup session for an OAuth provider like GitHub or Slack ──
// Uncomment the block below to add an OAuth provider alongside Metorial Search.
//
// let oauthProviderDeploymentId = process.env.OAUTH_PROVIDER_DEPLOYMENT_ID!;
// let oauthProviderId = process.env.OAUTH_PROVIDER_ID!;
// let oauthAuthMethodId = process.env.OAUTH_PROVIDER_AUTH_METHOD_ID!;
//
// let setupSession = await metorial.providerDeployments.setupSessions.create({
//   providerId: oauthProviderId,
//   providerAuthMethodId: oauthAuthMethodId
// });
//
// console.log('Complete OAuth at:', setupSession.url);
//
// let [completedSession] = await metorial.providerDeployments.setupSessions.waitForCompletion([
//   setupSession
// ]);

let result = await metorial.withProviderSession(
  metorialAiSdk,
  {
    providers: [
      { providerDeploymentId: deployment.id }
      // Add OAuth provider:
      // {
      //   providerDeploymentId: oauthProviderDeploymentId,
      //   providerAuthConfigId: completedSession.authConfig!.id
      // }
    ],
    streaming: true
  },
  async ({ tools, closeSession }) => {
    let result = streamText({
      model: anthropic('claude-sonnet-4-20250514'),
      prompt:
        'Search the web for the latest news about AI agents and summarize the top 3 stories.',
      stopWhen: stepCountIs(10),
      tools: tools,
      onStepFinish: step => {
        if (step.toolCalls?.length) {
          console.log(`\n🔧 ${step.toolCalls.map(tc => tc.toolName).join(', ')}\n`);
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
