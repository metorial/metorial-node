import { metorialAnthropic } from '@metorial/anthropic';
import Metorial from 'metorial';
import Anthropic from '@anthropic-ai/sdk';

let metorial = new Metorial({
  apiKey: process.env.METORIAL_API_KEY!
});

let anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
});

// To use a different provider (e.g. GitHub, Slack), create a deployment at https://platform.metorial.com
let deployment = await metorial.providerDeployments.create({
  name: 'Metorial Search',
  providerId: 'metorial-search'
});


let session = await metorial.connect({
  adapter: metorialAnthropic(),
  providers: [
    { providerDeploymentId: deployment.id }
  ]
});

let messages: Anthropic.Messages.MessageParam[] = [
  {
    role: 'user',
    content:
      'Search the web for the latest news about AI agents and summarize the top 3 stories.'
  }
];

for (let i = 0; i < 10; i++) {
  let response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages,
    tools: session.tools()
  });

  let toolCalls = response.content.filter(
    (c): c is Anthropic.Messages.ToolUseBlock => c.type === 'tool_use'
  );

  if (toolCalls.length === 0) {
    let finalText = response.content
      .filter((c): c is Anthropic.Messages.TextBlock => c.type === 'text')
      .map(c => c.text)
      .join('');
    console.log(finalText);
    break;
  }

  console.log(`🔧 Using tools: ${toolCalls.map(tc => tc.name).join(', ')}`);
  let toolResponses = await session.callTools(toolCalls);
  messages.push({ role: 'assistant', content: response.content as any }, toolResponses);
}
