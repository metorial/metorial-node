import { createOpenAICompatibleMcpSdk } from "@metorial/openai-compatible";
import Metorial from "metorial";
import OpenAI from "openai";

let metorial = new Metorial({
  apiKey: process.env.METORIAL_API_KEY!,
});

// Initialize OpenAI (or any OpenAI-compatible provider)
let openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// To use a different provider (e.g. GitHub, Slack), create a deployment at https://platform.metorial.com
let deployment = await metorial.providerDeployments.create({
  name: "Metorial Search",
  providerId: "metorial-search",
});


let session = await metorial.connect({
  adapter: createOpenAICompatibleMcpSdk()(),
  providers: [
    { providerDeploymentId: deployment.id },
  ],
});

let messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
  {
    role: "user",
    content: "Search the web for the latest news about AI agents and summarize the top 3 stories.",
  },
];

for (let i = 0; i < 10; i++) {
  let response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    tools: session.tools() as any,
  });
  let choice = response.choices[0]!;
  let toolCalls = choice.message.tool_calls;

  if (!toolCalls || toolCalls.length === 0) {
    console.log(choice.message.content);
    break;
  }

  console.log(
    `🔧 Using tools: ${toolCalls.map((tc) => tc.function.name).join(", ")}`
  );
  let toolResponses = await session.callTools(toolCalls);
  messages.push(
    { role: "assistant", tool_calls: choice.message.tool_calls },
    ...toolResponses
  );
}
