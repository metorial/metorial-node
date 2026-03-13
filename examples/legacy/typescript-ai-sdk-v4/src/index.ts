import { openai } from '@ai-sdk/openai';
import { metorialAiSdk } from '@metorial/ai-sdk/v4';
import { Metorial } from 'metorial';
import { generateText } from 'ai';

let metorial = new Metorial({
  apiKey: process.env.METORIAL_API_KEY!
});

let serverDeploymentId = process.env.SERVER_DEPLOYMENT_ID!;
let oauthServerDeploymentId = process.env.OAUTH_SERVER_DEPLOYMENT_ID!;

// ── OAuth flow ──────────────────────────────────────────────────────
// Create an OAuth session — only needs to be done once per user.

let oauthSession = await metorial.v1.oauth.sessions.create({
  serverDeploymentId: oauthServerDeploymentId
});

console.log('Complete OAuth at:', oauthSession.url);

await metorial.v1.oauth.waitForCompletion([oauthSession]);
console.log('OAuth completed!');

// ── Start session with both server deployments ──────────────────────

await metorial.v1.withProviderSession(
  metorialAiSdk,
  {
    serverDeployments: [
      { serverDeploymentId },
      {
        serverDeploymentId: oauthServerDeploymentId,
        oauthSessionId: oauthSession.id
      }
    ]
  },
  async ({ tools, closeSession }) => {
    let result = await generateText({
      model: openai('gpt-4o'),
      prompt: `
        1. Research Metorial
        2. Summarize the findings
        3. Post them in the #general channel
      `,
      maxSteps: 10,
      tools: tools
    });

    console.log(result.text);

    await closeSession();
  }
);
