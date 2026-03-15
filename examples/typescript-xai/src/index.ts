import { metorialXai } from '@metorial/xai';
import { Metorial } from 'metorial';
import OpenAI from 'openai';

let metorial = new Metorial({
  apiKey: process.env.METORIAL_API_KEY!
});

let xai = new OpenAI({
  apiKey: process.env.XAI_API_KEY!,
  baseURL: 'https://api.x.ai/v1'
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
  metorialXai,
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
  async session => {
    let messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'user',
        content:
          'Search the web for the latest news about AI agents and summarize the top 3 stories.'
      }
    ];

    for (let i = 0; i < 10; i++) {
      let response = await xai.chat.completions.create({
        model: 'grok-2-latest',
        messages,
        tools: session.tools
      });

      let choice = response.choices[0]!;
      let toolCalls = choice.message.tool_calls;

      if (!toolCalls || toolCalls.length === 0) {
        console.log(choice.message.content);
        return;
      }

      console.log(`🔧 Using tools: ${toolCalls.map(tc => tc.function.name).join(', ')}`);
      let toolResponses = await session.callTools(toolCalls);
      messages.push({ role: 'assistant', tool_calls: toolCalls }, ...toolResponses);
    }

    throw new Error('No final response received after 10 iterations');
  }
);
