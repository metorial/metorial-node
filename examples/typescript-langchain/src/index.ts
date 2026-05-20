import { ChatAnthropic } from '@langchain/anthropic';
import { metorialLangchain } from '@metorial/langchain';
import { createAgent } from 'langchain';
import Metorial from 'metorial';

let metorial = new Metorial({
  apiKey: process.env.METORIAL_API_KEY!
});

// To use a different provider (e.g. GitHub, Slack), create a deployment at https://platform.metorial.com
let deployment = await metorial.providerDeployments.create({
  name: 'Metorial Search',
  providerId: 'metorial-search'
});

let session = await metorial.connect({
  adapter: metorialLangchain(),
  providers: [{ providerDeploymentId: deployment.id }]
});

let llm = new ChatAnthropic({
  model: 'claude-sonnet-4-20250514',
  apiKey: process.env.ANTHROPIC_API_KEY!
});

let agent = createAgent({ model: llm, tools: session.tools() });

let agentInputs = {
  messages: [
    {
      role: 'user' as const,
      content:
        'Search the web for the latest news about AI agents and summarize the top 3 stories.'
    }
  ]
};

let stream = await agent.stream(agentInputs, { streamMode: 'values' });

for await (let step of stream) {
  let lastMessage = step.messages.at(-1);
  if (lastMessage?.content && typeof lastMessage.content === 'string') {
    console.log(`[${lastMessage.type}]: ${lastMessage.content}`);
    console.log('-----\n');
  }
}
