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

// Server deployment IDs - create these at https://app.metorial.com
let normalServerDeploymentId = process.env.SERVER_DEPLOYMENT_ID!;
let oauthServerDeploymentId = process.env.OAUTH_SERVER_DEPLOYMENT_ID!;

// Create OAuth session for the OAuth-enabled server
// this just needs to be done once per user
let oauthSession = await metorial.v1.oauth.sessions.create({
  serverDeploymentId: oauthServerDeploymentId,
  // Optional: callback URL after OAuth completion
  // callbackUri: "https://your-app.com/oauth/callback",
});

console.log("🔑 OAuth URL - Complete authorization:", oauthSession.url);

// Wait for user to complete OAuth authorization
await metorial.v1.oauth.waitForCompletion([oauthSession]);
console.log("✅ OAuth authorization completed!");

// Create a Metorial session with the Mistral provider
await metorial.v1.withProviderSession(
  metorialMistral,
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
