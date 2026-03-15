import { metorialLangchain } from '@metorial/langchain';
import { ChatAnthropic } from '@langchain/anthropic';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { Metorial } from 'metorial';

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

await metorial.withProviderSession(
  metorialLangchain,
  {
    providers: [
      { providerDeploymentId: deployment.id }
      // Add OAuth provider:
      // {
      //   providerDeploymentId: oauthProviderDeploymentId,
      //   providerAuthConfigId: completedSession.authConfig!.id
      // }
    ]
  },
  async ({ tools }) => {
    let llm = new ChatAnthropic({
      model: 'claude-sonnet-4-20250514',
      apiKey: process.env.ANTHROPIC_API_KEY!
    });

    let agent = createReactAgent({ llm, tools });

    let stream = await agent.stream({
      messages: [
        {
          role: 'user',
          content:
            'Search the web for the latest news about AI agents and summarize the top 3 stories.'
        }
      ]
    });

    for await (let event of stream) {
      if ('agent' in event) {
        let msg = event.agent.messages[event.agent.messages.length - 1];
        if (msg && 'content' in msg && typeof msg.content === 'string') {
          console.log(msg.content);
        }
      }
    }
  }
);
