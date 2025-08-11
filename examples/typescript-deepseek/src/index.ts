import { metorialDeepseek } from '@metorial/deepseek';
import { Metorial } from 'metorial';
import OpenAI from 'openai';

let metorial = new Metorial({
  apiKey: '...your-metorial-api-key...'
});

let deepseek = new OpenAI({
  apiKey: '...your-deepseek-api-key...',
  baseURL: 'https://api.deepseek.com'
});

await metorial.withProviderSession(
  metorialDeepseek,
  {
    serverDeployments: ['...server-deployment-id...']
  },
  async session => {
    let messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'user',
        content:
          'Summarize the README.md file of the metorial/websocket-explorer repository on GitHub?'
      }
    ];

    // Some servers require you to dedupe tools by name
    let uniqueTools = Array.from(
      new Map(session.tools.map(t => [t.function.name, t])).values()
    );

    for (let i = 0; i < 10; i++) {
      let response = await deepseek.chat.completions.create({
        model: 'deepseek-chat',
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
