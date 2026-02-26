import { metorialOpenAI } from "@metorial/openai";
import { Metorial } from "metorial";
import OpenAI from "openai";

// Initialize Metorial client
// Get your API key at https://app.metorial.com
let metorial = new Metorial({
  apiKey: process.env.METORIAL_API_KEY!,
});

// Initialize OpenAI
let openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
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

// Create a Metorial v2 (Magnetar) session with the OpenAI provider
await metorial.withProviderSession(
  metorialOpenAI.chatCompletions,
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
    // Message history for the chat completion
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

    for (let i = 0; i < 10; i++) {
      // Get next response from OpenAI
      let response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages,
        tools: session.tools,
      });
      let choice = response.choices[0]!;

      let toolCalls = choice.message.tool_calls;

      // No more tool calls -> we have the final response
      if (!toolCalls) {
        console.log("🤖 AI Response:\n");
        console.log(choice.message.content);
        return;
      }

      // Pass tool calls to Metorial
      console.log(
        `🔧 Using tools: ${toolCalls.map((tc) => tc.function.name).join(", ")}`
      );
      let toolResponses = await session.callTools(toolCalls);

      // Save the tool call and tool responses to the message history
      messages.push(
        {
          role: "assistant",
          tool_calls: choice.message.tool_calls,
        },
        ...toolResponses
      );
    }

    throw new Error("No final response received after 10 iterations");
  }
);
