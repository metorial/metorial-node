import { metorialLangchain } from '@metorial/langchain';
import { ChatAnthropic } from '@langchain/anthropic';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
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
  providers: [
    { providerDeploymentId: deployment.id }
  ]
});

let llm = new ChatAnthropic({
  model: 'claude-sonnet-4-20250514',
  apiKey: process.env.ANTHROPIC_API_KEY!
});

let agent = createReactAgent({ llm, tools: session.tools() });

let stream = await agent.stream({
  messages: [
    {
      role: 'user',
      content:
        'Search the web for the latest news about AI agents and summarize the top 3 stories.'
    }
  ]
});

for await (let event of stream) {
  if ('agent' in event) {
    let msg = event.agent.messages[event.agent.messages.length - 1];
    if (msg && 'content' in msg && typeof msg.content === 'string') {
      console.log(msg.content);
    }
  }
}
