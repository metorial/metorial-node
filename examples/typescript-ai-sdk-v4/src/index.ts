import { openai } from "@ai-sdk/openai";
import { metorialAiSdk } from "@metorial/ai-sdk/v4";
import { Metorial } from "@metorial/sdk";
import { generateText } from "ai";

// Initialize Metorial client
// Get your API key at https://app.metorial.com
let metorial = new Metorial({
  apiKey: "your-metorial-api-key",
});

// Server deployment IDs - create these at https://app.metorial.com
// Normal server deployment (e.g., Exa or Tavily for web search)
let normalServerDeploymentId = "your-normal-server-deployment-id";
// OAuth-enabled server deployment (e.g., Slack, GitHub, SAP, etc.)
let oauthServerDeploymentId = "your-oauth-server-deployment-id";

// Create OAuth session for the OAuth-enabled server
// this just needs to be done once per user
let oauthSession = await metorial.oauth.sessions.create({
  serverDeploymentId: oauthServerDeploymentId,
  // Optional: callback URL after OAuth completion
  // callbackUri: "https://your-app.com/oauth/callback",
});

console.log("🔑 OAuth URL - Complete authorization:", oauthSession.url);

// Wait for user to complete OAuth authorization
await metorial.oauth.waitForCompletion([oauthSession]);
console.log("✅ OAuth authorization completed!");

// Start session with both normal and OAuth server deployments
await metorial.withProviderSession(
  metorialAiSdk,
  {
    serverDeployments: [
      // Normal server deployment
      { serverDeploymentId: normalServerDeploymentId },
      // OAuth server deployment with session
      {
        serverDeploymentId: oauthServerDeploymentId,
        oauthSessionId: oauthSession.id,
      },
    ],
  },
  async ({ tools, closeSession }) => {
    let result = await generateText({
      model: openai("gpt-4o"),
      prompt: `
        1. Research Metorial
        2. Summarize the findings
        3. Post them in the #general channel
      `,
      maxSteps: 10,
      tools: tools,
    });

    console.log("🤖 AI Response:\n");
    console.log(result.text);

    await closeSession();
  }
);
