import { metorialMistral } from '@metorial/mistral';
import Metorial from 'metorial';
import { Mistral } from '@mistralai/mistralai';

let metorial = new Metorial({
  apiKey: process.env.METORIAL_API_KEY!
});

let mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY!
});

// To use a different provider (e.g. GitHub, Slack), create a deployment at https://platform.metorial.com
let deployment = await metorial.providerDeployments.create({
  name: 'Metorial Search',
  providerId: 'metorial-search'
});


let session = await metorial.connect({
  adapter: metorialMistral(),
  providers: [
    { providerDeploymentId: deployment.id }
  ]
});

let messages: any[] = [
  {
    role: 'user',
    content:
      'Search the web for the latest news about AI agents and summarize the top 3 stories.'
  }
];

for (let i = 0; i < 10; i++) {
  let response = await mistral.chat.complete({
    model: 'mistral-large-latest',
    messages,
    tools: session.tools()
  });

  let choice = response.choices[0]!;
  let toolCalls = choice.message.toolCalls;

  if (!toolCalls || toolCalls.length === 0) {
    console.log(choice.message.content);
    break;
  }

  console.log(`🔧 Using tools: ${toolCalls.map(tc => tc.function.name).join(', ')}`);
  let toolResponses = await session.callTools(toolCalls);
  messages.push({ role: 'assistant' as const, toolCalls }, ...toolResponses);
}
