import { metorialGoogle } from "@metorial/google";
import { Metorial } from "metorial";
import { GoogleGenAI } from "@google/genai";

let metorial = new Metorial({
  apiKey: process.env.METORIAL_API_KEY!,
});

let genAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY!,
});

// Create a deployment for Metorial Search — built-in web search, no auth needed.
// To use a different provider (e.g. GitHub, Slack), create a deployment at
// https://platform.metorial.com and replace this with:
//   let providerDeploymentId = process.env.PROVIDER_DEPLOYMENT_ID!;
let deployment = await metorial.providerDeployments.create({
  name: "Metorial Search",
  providerId: "metorial-search",
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
  metorialGoogle,
  {
    providers: [
      { providerDeploymentId: deployment.id },
      // Add OAuth provider:
      // {
      //   providerDeploymentId: oauthProviderDeploymentId,
      //   providerAuthConfigId: completedSession.authConfig!.id
      // }
    ],
  },
  async (session) => {
    let response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: "Search the web for the latest news about AI agents and summarize the top 3 stories.",
            },
          ],
        },
      ],
      config: {
        tools: session.tools,
      },
    });

    let text = response.candidates?.[0]?.content?.parts?.[0]?.text;

    let functionCalls = response.candidates?.[0]?.content?.parts
      ?.filter((part) => part.functionCall)
      .map((part) => part.functionCall!);

    if (functionCalls && functionCalls.length > 0) {
      console.log(
        `🔧 Using tools: ${functionCalls.map((fc) => fc.name).join(", ")}`
      );
      let toolResponses = await session.callTools(functionCalls);
      console.log("Tool responses:", toolResponses);
    }

    if (text) {
      console.log(text);
    }
  }
);
