import { metorialGoogle } from "@metorial/google";
import { Metorial } from "metorial";
import { GoogleGenAI } from "@google/genai";

// Initialize Metorial client
// Get your API key at https://app.metorial.com
let metorial = new Metorial({
  apiKey: "your-metorial-api-key",
});

// Initialize Google GenAI
let genAI = new GoogleGenAI({
  apiKey: "your-google-gen-api-key",
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

// Create a Metorial session with the Google provider
await metorial.withProviderSession(
  metorialGoogle,
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
    try {
      let response = await genAI.models.generateContent({
        model: "gemini-1.5-pro-latest",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `
                  1. Research Metorial
                  2. Summarize the findings
                  3. Post them in the #general channel
                `,
              },
            ],
          },
        ],
        config: {
          tools: session.tools,
        },
      });

      let text = response.candidates?.[0]?.content?.parts?.[0]?.text;

      // Check for function calls
      let functionCalls = response.candidates?.[0]?.content?.parts
        ?.filter((part) => part.functionCall)
        .map((part) => part.functionCall!);

      if (functionCalls && functionCalls.length > 0) {
        console.log(
          `🔧 Using tools: ${functionCalls.map((fc) => fc.name).join(", ")}`
        );
        let toolResponses = await session.callTools(functionCalls);
        console.log("✅ Tool responses:", toolResponses);
      }

      if (text) {
        console.log("🤖 AI Response:\n");
        console.log(text);
      }
    } catch (error) {
      console.error("❌ Error during generation:", error);
    }
  }
);
