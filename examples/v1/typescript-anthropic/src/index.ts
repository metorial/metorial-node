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

// Create a Metorial session with the Anthropic provider
await metorial.withProviderSession(
  metorialAnthropic,
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
