import { metorialXai } from "@metorial/xai";
import { Metorial } from "metorial";
import OpenAI from "openai";

// Initialize Metorial client
// Get your API key at https://app.metorial.com
let metorial = new Metorial({
  apiKey: process.env.METORIAL_API_KEY!,
});

// Initialize xAI
let xai = new OpenAI({
  apiKey: process.env.XAI_API_KEY!,
  baseURL: "https://api.x.ai/v1",
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

// Create a Metorial session with the xAI provider
await metorial.v1.withProviderSession(
  metorialXai,
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

    // Dedupe tools by name
    let uniqueTools = Array.from(
      new Map(session.tools.map((t) => [t.function.name, t])).values()
    );

    for (let i = 0; i < 10; i++) {
      // Ask xAI, passing only unique tools
      let response = await xai.chat.completions.create({
        model: "grok-2-latest",
        messages,
        tools: uniqueTools,
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
  }
);
