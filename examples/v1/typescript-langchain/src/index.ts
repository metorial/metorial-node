import { ChatOpenAI } from "@langchain/openai";
import { metorialLangchain } from "@metorial/langchain";
import { Metorial } from "@metorial/sdk";
import { createAgent } from "langchain";

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
