import { metorialTogetherAi } from "@metorial/togetherai";
import Metorial from "metorial";
import OpenAI from "openai";

let metorial = new Metorial({
  apiKey: process.env.METORIAL_API_KEY!,
});

let togetherai = new OpenAI({
  apiKey: process.env.TOGETHERAI_API_KEY!,
  baseURL: "https://api.together.xyz/v1",
});

// To use a different provider (e.g. GitHub, Slack), create a deployment at https://platform.metorial.com
let deployment = await metorial.providerDeployments.create({
  name: "Metorial Search",
  providerId: "metorial-search",
});


let session = await metorial.connect({
  adapter: metorialTogetherAi(),
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
  let response = await togetherai.chat.completions.create({
    model: "mistralai/Mistral-7B-Instruct-v0.2",
    messages,
    tools: session.tools(),
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
    { role: "assistant", tool_calls: toolCalls },
    ...toolResponses
  );
}
