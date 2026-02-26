import { metorialMistral } from "@metorial/mistral";
import { Metorial } from "metorial";
import { Mistral } from "@mistralai/mistralai";

// Initialize Metorial client
// Get your API key at https://app.metorial.com
let metorial = new Metorial({
  apiKey: process.env.METORIAL_API_KEY!,
});

// Initialize Mistral
let mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY!,
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

// Create a Metorial v2 (Magnetar) session with the Mistral provider
await metorial.withProviderSession(
  metorialMistral,
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
    let messages: any[] = [
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
      // Align the schema to include additionalProperties: false for Mistral compatibility
      let fixedTools = session.tools.map((tool) => {
        if (tool.function?.parameters) {
          let fixedParams = { ...tool.function.parameters };
          fixedParams.additionalProperties = false;

          // Also align nested objects
          if (fixedParams.properties) {
            Object.values(fixedParams.properties).forEach((prop: any) => {
              if (prop && typeof prop === "object" && prop.type === "object") {
                prop.additionalProperties = false;
              }
            });
          }

          return {
            ...tool,
            function: {
              ...tool.function,
              parameters: fixedParams,
            },
          };
        }
        return tool;
      });

      for (let i = 0; i < 10; i++) {
        // Ask Mistral with tools
        let response = await mistral.chat.complete({
          model: "mistral-large-latest",
          messages,
          tools: fixedTools,
        });

        let choice = response.choices[0]!;
        let toolCalls = choice.message.toolCalls;

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
          { role: "assistant" as const, toolCalls },
          ...toolResponses
        );
      }

      throw new Error("No final response received after 10 iterations");
    } catch (error: any) {
      console.log("⚠️ Mistral API error:", error.message);
      if (error.response) {
        console.log("Error details:", error.response.data);
      }
    }
  }
);
