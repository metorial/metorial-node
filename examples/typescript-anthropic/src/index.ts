import { metorialAnthropic } from "@metorial/anthropic";
import { Metorial } from "metorial";
import Anthropic from "@anthropic-ai/sdk";

let metorial = new Metorial({
  apiKey: process.env.METORIAL_API_KEY!,
});

let anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
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
  metorialAnthropic,
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
    let messages: Anthropic.Messages.MessageParam[] = [
      {
        role: "user",
        content: "Search the web for the latest news about AI agents and summarize the top 3 stories.",
      },
    ];

    // Dedupe tools by name
    let uniqueTools = Array.from(
      new Map(session.tools.map((t) => [t.name, t])).values()
    );

    for (let i = 0; i < 10; i++) {
      let response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages,
        tools: uniqueTools,
      });

      let toolCalls = response.content.filter(
        (c): c is Anthropic.Messages.ToolUseBlock => c.type === "tool_use"
      );

      if (toolCalls.length === 0) {
        let finalText = response.content
          .filter((c): c is Anthropic.Messages.TextBlock => c.type === "text")
          .map((c) => c.text)
          .join("");
        console.log(finalText);
        return;
      }

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
