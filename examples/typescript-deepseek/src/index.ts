import { metorialDeepseek } from "@metorial/deepseek";
import { Metorial } from "metorial";
import OpenAI from "openai";

// Initialize Metorial client
// Get your API key at https://app.metorial.com
let metorial = new Metorial({
  apiKey: "your-metorial-api-key",
});

// Initialize DeepSeek
let deepseek = new OpenAI({
  apiKey: "your-deepseek-api-key",
  baseURL: "https://api.deepseek.com",
});

// Server deployment IDs - create these at https://app.metorial.com
// Normal server deployment (e.g., Exa or Tavily for web search)
let normalServerDeploymentId = "your-normal-server-deployment-id";
// OAuth-enabled server deployment (e.g., Slack, GitHub, SAP, etc.)
let oauthServerDeploymentId = "your-oauth-server-deployment-id";

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

// Create a Metorial session with the DeepSeek provider
await metorial.withProviderSession(
  metorialDeepseek,
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

    // Some servers require you to dedupe tools by name
    let uniqueTools = Array.from(
      new Map(session.tools.map((t) => [t.function.name, t])).values()
    );

    for (let i = 0; i < 10; i++) {
      let response = await deepseek.chat.completions.create({
        model: "deepseek-chat",
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
      messages.push({ role: "assistant", tool_calls: toolCalls }, ...toolResponses);
    }

    throw new Error("No final response received after 10 iterations");
  }
);
