import { anthropic } from '@ai-sdk/anthropic';
import { metorialAiSdk } from '@metorial/ai-sdk/v4';
import { Metorial } from 'metorial';
import { streamText, stepCountIs } from 'ai';

let metorial = new Metorial({
  apiKey: process.env.METORIAL_API_KEY!,
});

let providerDeploymentId = process.env.PROVIDER_DEPLOYMENT_ID!;
let oauthProviderDeploymentId = process.env.OAUTH_PROVIDER_DEPLOYMENT_ID!;
let oauthProviderId = process.env.OAUTH_PROVIDER_ID!;
let oauthAuthMethodId = process.env.OAUTH_PROVIDER_AUTH_METHOD_ID!;

// ── Setup session for OAuth provider ────────────────────────────────
// Creates an OAuth flow — the user completes auth in their browser,
// then an auth config is automatically created.

let setupSession = await metorial.providerDeployments.setupSessions.create({
  providerId: oauthProviderId,
  providerAuthMethodId: oauthAuthMethodId
});

console.log('Setup session created:', setupSession.id);
console.log('Complete OAuth at:', setupSession.url);

let [completedSession] = await metorial.providerDeployments.setupSessions.waitForCompletion([
  setupSession
]);

console.log('OAuth completed! Auth config:', completedSession.authConfig?.id);

// ── Start streaming session with both providers ─────────────────────

let result = await metorial.withProviderSession(
  metorialAiSdk,
  {
    providers: [
      // Normal provider (no auth required)
      { providerDeploymentId },
      // OAuth provider (uses the auth config from the setup session)
      {
        providerDeploymentId: oauthProviderDeploymentId,
        providerAuthConfigId: completedSession.authConfig!.id
      }
    ],
    streaming: true
  },
  async ({ tools, closeSession }) => {
    let result = streamText({
      model: anthropic('claude-sonnet-4-20250514'),
      prompt: 'What are the top stories on Hacker News today?',
      stopWhen: stepCountIs(10),
      tools: tools,
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
