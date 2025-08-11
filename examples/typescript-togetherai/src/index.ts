import { metorialTogetherAi } from '@metorial/togetherai';
import { Metorial } from 'metorial';
import OpenAI from 'openai';

let metorial = new Metorial({
  apiKey: '...your-metorial-api-key...'
});

let togetherai = new OpenAI({
  apiKey: '...your-togetherai-api-key...',
  baseURL: 'https://api.together.xyz/v1'
});

await metorial.withProviderSession(
  metorialTogetherAi,
  { serverDeployments: ['...server-deployment-id...'] },
  async session => {
    let messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'user',
        content:
          'Summarize the README.md file of the metorial/websocket-explorer repository on GitHub.'
      }
    ];

    try {
      for (let i = 0; i < 10; i++) {
        let response = await togetherai.chat.completions.create({
          model: 'mistralai/Mistral-7B-Instruct-v0.2',
          messages,
          tools: session.tools
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
    } catch (error) {
      console.log('⚠️ TogetherAI API error:', error.message);
      if (error.response) {
        console.log('Error details:', error.response.data);
      }
    }
  }
);
