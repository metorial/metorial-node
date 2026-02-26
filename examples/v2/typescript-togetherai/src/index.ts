import { metorialTogetherAi } from "@metorial/togetherai";
import { Metorial } from "metorial";
import OpenAI from "openai";

// Initialize Metorial client
// Get your API key at https://app.metorial.com
let metorial = new Metorial({
  apiKey: process.env.METORIAL_API_KEY!,
});

// Initialize TogetherAI
let togetherai = new OpenAI({
  apiKey: process.env.TOGETHERAI_API_KEY!,
  baseURL: "https://api.together.xyz/v1",
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

// Create a Metorial v2 (Magnetar) session with the TogetherAI provider
await metorial.withProviderSession(
  metorialTogetherAi,
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
    let messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "user",
        content: `
          1. Research Metorial
          2. Summarize the findings
          3. Post them in the #general channel
        `,
      },
    ];

    try {
      for (let i = 0; i < 10; i++) {
        let response = await togetherai.chat.completions.create({
          model: "mistralai/Mistral-7B-Instruct-v0.2",
          messages,
          tools: session.tools,
        });

        let choice = response.choices[0]!;
        let toolCalls = choice.message.tool_calls;

        // If no more tools to call, print the assistant's reply and exit
        if (!toolCalls || toolCalls.length === 0) {
          console.log("🤖 AI Response:\n");
          console.log(choice.message.content);
          return;
        }

        // Otherwise, invoke them via Metorial and append to history
        console.log(
          `🔧 Using tools: ${toolCalls.map((tc) => tc.function.name).join(", ")}`
        );
        let toolResponses = await session.callTools(toolCalls);
        messages.push(
          { role: "assistant", tool_calls: toolCalls },
          ...toolResponses
        );
      }

      throw new Error("No final response received after 10 iterations");
    } catch (error: any) {
      console.log("⚠️ TogetherAI API error:", error.message);
      if (error.response) {
        console.log("Error details:", error.response.data);
      }
    }
  }
);
