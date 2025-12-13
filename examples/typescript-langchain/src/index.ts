import { ChatOpenAI } from "@langchain/openai";
import { metorialLangchain } from "@metorial/langchain";
import { Metorial } from "@metorial/sdk";
import { createAgent } from "langchain";

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

// Create a Metorial session with the LangChain provider
await metorial.withProviderSession(
  metorialLangchain,
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
  async (session) => {
    console.log("🔧 Available tools:", session.tools.map((t) => t.name));

    let agent = createAgent({
      model: new ChatOpenAI({ model: "gpt-4o" }),
      tools: session.tools,
    });

    let result = await agent.invoke({
      messages: [
        {
          role: "user",
          content: `
            1. Research Metorial
            2. Summarize the findings
            3. Post them in the #general channel
          `,
        },
      ],
    });

    console.log("🤖 AI Response:\n");
    console.log(JSON.stringify(result, null, 2));
  }
);
