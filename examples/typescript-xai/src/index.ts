import { metorialXai } from '@metorial/xai';
import { Metorial } from 'metorial';
import OpenAI from 'openai';

// Initialize Metorial
let metorial = new Metorial({
  apiKey: '...metorial-api-key...'
});

// Initialize XAI
let xai = new OpenAI({
  apiKey: '...xai-api-key...',
  baseURL: 'https://api.x.ai/v1'
});

// Create a Metorial session with the XAI provider
await metorial.withProviderSession(
  metorialXai,
  { serverDeployments: ['...server-deployment-id...'] },
  async session => {
    // Build initial message history
    let messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'user',
        content:
          'Summarize the README.md file of the metorial/websocket-explorer repository on GitHub.'
      }
    ];

    // Dedupe tools by name
    let uniqueTools = Array.from(
      new Map(session.tools.map(t => [t.function.name, t])).values()
    );

    for (let i = 0; i < 10; i++) {
      // Ask XAI, passing only unique tools
      let response = await xai.chat.completions.create({
        model: 'x-1',
        messages,
        tools: uniqueTools
      });

      let choice = response.choices[0]!;
      let toolCalls = choice.message.tool_calls;

      // If no more tools to call, print the assistant's reply and exit
      if (!toolCalls || toolCalls.length === 0) {
        console.log(choice.message.content);
        return;
      }

      // Otherwise, invoke them via Metorial and append to history
      let toolResponses = await session.callTools(toolCalls);
      messages.push({ role: 'assistant', tool_calls: toolCalls }, ...toolResponses);
    }

    throw new Error('No final response received after 10 iterations');
  }
);
