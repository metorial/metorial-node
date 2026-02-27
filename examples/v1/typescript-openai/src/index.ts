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

// Create a Metorial session with the OpenAI provider
await metorial.v1.withProviderSession(
  metorialOpenAI.chatCompletions,
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
