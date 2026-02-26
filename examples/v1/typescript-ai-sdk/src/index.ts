import { anthropic } from "@ai-sdk/anthropic";
import { metorialAiSdk } from "@metorial/ai-sdk";
import { Metorial } from "@metorial/sdk";
import { stepCountIs, streamText } from "ai";

// Initialize Metorial client
// Get your API key at https://app.metorial.com
let metorial = new Metorial({
  apiKey: process.env.METORIAL_API_KEY!,
});

// Server deployment IDs - create these at https://app.metorial.com
let normalServerDeploymentId = process.env.SERVER_DEPLOYMENT_ID!;
let oauthServerDeploymentId = process.env.OAUTH_SERVER_DEPLOYMENT_ID!;

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
let result = await metorial.withProviderSession(
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
    streaming: true, // Required for streaming with tool calls
  },
  async ({ tools, closeSession }) => {
    let result = streamText({
      model: anthropic("claude-sonnet-4-5"),
      prompt: `
        1. Research Metorial
        2. Summarize the findings
        3. Post them in the #general channel
      `,
      stopWhen: stepCountIs(25),
      tools: tools,
      onStepFinish: (step: any) => {
        if (step.toolCalls) {
          console.log(
            `🔧 Using tools: ${step.toolCalls.map((tc: any) => tc.toolName).join(", ")}`
          );
        }
      },
      onFinish: async () => {
        console.log("\n🎯 Stream completed!");
        await closeSession();
      },
    });

    return result;
  }
);

console.log("🤖 AI Response:\n");
for await (const textPart of result.textStream) {
  process.stdout.write(textPart);
}
