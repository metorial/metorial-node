import { metorialGoogle } from "@metorial/google";
import { Metorial } from "metorial";
import { GoogleGenAI } from "@google/genai";

// Initialize Metorial client
// Get your API key at https://app.metorial.com
let metorial = new Metorial({
  apiKey: process.env.METORIAL_API_KEY!,
});

// Initialize Google GenAI
let genAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY!,
});

// Provider deployment IDs - create these at https://app.metorial.com
let providerDeploymentId = process.env.PROVIDER_DEPLOYMENT_ID!;
let oauthProviderDeploymentId = process.env.OAUTH_PROVIDER_DEPLOYMENT_ID!;
let oauthProviderId = process.env.OAUTH_PROVIDER_ID!;
let oauthAuthMethodId = process.env.OAUTH_PROVIDER_AUTH_METHOD_ID!;

// ── Setup session for OAuth provider ────────────────────────────────
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

// Create a Metorial v2 (Magnetar) session with the Google provider
await metorial.withProviderSession(
  metorialGoogle,
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
