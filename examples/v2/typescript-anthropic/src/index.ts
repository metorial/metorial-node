import { metorialAnthropic } from "@metorial/anthropic";
import { Metorial } from "metorial";
import Anthropic from "@anthropic-ai/sdk";

// Initialize Metorial client
// Get your API key at https://app.metorial.com
let metorial = new Metorial({
  apiKey: process.env.METORIAL_API_KEY!,
});

// Initialize Anthropic
let anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
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

// Create a Metorial v2 (Magnetar) session with the Anthropic provider
await metorial.withProviderSession(
  metorialAnthropic,
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
    // Build initial message history
    let messages: Anthropic.Messages.MessageParam[] = [
      {
        role: "user",
        content: `
          1. Research Metorial
          2. Summarize the findings
          3. Post them in the #general channel
        `,
      },
    ];

    // Dedupe tools by name
    let uniqueTools = Array.from(
      new Map(session.tools.map((t) => [t.name, t])).values()
    );

    for (let i = 0; i < 10; i++) {
      // Ask Anthropic, passing only unique tools
      let response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages,
        tools: uniqueTools,
      });

      // Extract any tool calls from the response
      let toolCalls = response.content.filter(
        (c): c is Anthropic.Messages.ToolUseBlock => c.type === "tool_use"
      );

      // If no more tools to call, print the assistant's reply and exit
      if (toolCalls.length === 0) {
        let finalText = response.content
          .filter((c): c is Anthropic.Messages.TextBlock => c.type === "text")
          .map((c) => c.text)
          .join("");
        console.log("🤖 AI Response:\n");
        console.log(finalText);
        return;
      }

      // Otherwise, invoke them via Metorial and append to history
      console.log(
        `🔧 Using tools: ${toolCalls.map((tc) => tc.name).join(", ")}`
      );
      let toolResponses = await session.callTools(toolCalls);
      messages.push(
        { role: "assistant", content: response.content as any },
        toolResponses
      );
    }

    throw new Error("No final response received after 10 iterations");
  }
);
