import { metorialAnthropic } from '@metorial/anthropic';
import { Metorial } from 'metorial';
import Anthropic from '@anthropic-ai/sdk';

// Initialize Metorial
const metorial = new Metorial({
  apiKey: '...metorial-api-key...'
});

// Initialize Anthropic
const anthropic = new Anthropic({
  apiKey: '...anthropic-api-key...'
});

// Create a Metorial session with the Anthropic provider
await metorial.withProviderSession(
  metorialAnthropic,
  { serverDeployments: ['...server-deployment-id...'] },
  async session => {
    // Build initial message history
    const messages: Anthropic.Messages.MessageParam[] = [
      {
        role: 'user',
        content: 'Summarize the notion page with id page_id ...page-id... in my workspace.'
      }
    ];

    // Dedupe tools by name
    const uniqueTools = Array.from(new Map(session.tools.map(t => [t.name, t])).values());

    for (let i = 0; i < 10; i++) {
      // Ask Anthropic, passing only unique tools
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages,
        tools: uniqueTools
      });

      // Extract any tool calls from the response
      const toolCalls = response.content.filter(
        (c): c is Anthropic.Messages.ToolUseBlock => c.type === 'tool_use'
      );

      // If no more tools to call, print the assistant’s reply and exit
      if (toolCalls.length === 0) {
        const finalText = response.content
          .filter((c): c is Anthropic.Messages.TextBlock => c.type === 'text')
          .map(c => c.text)
          .join('');
        console.log(finalText);
        return;
      }

      // Otherwise, invoke them via Metorial and append to history
      const toolResponses = await session.callTools(toolCalls);
      messages.push({ role: 'assistant', content: response.content as any }, toolResponses);
    }

    throw new Error('No final response received after 10 iterations');
  }
);
