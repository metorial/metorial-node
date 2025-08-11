import { createOpenAICompatibleMcpSdk } from '@metorial/openai-compatible';
import { Metorial } from 'metorial';
import OpenAI from 'openai';

let metorial = new Metorial({
  apiKey: '...your-metorial-api-key...'
});

// Note: You need to provide your own OpenAI API key here
// Get one from: https://platform.openai.com/account/api-keys
let openai = new OpenAI({
  apiKey: 'sk-your-openai-api-key-here' // Replace with your actual OpenAI API key
});

let metorialOpenAICompatible = createOpenAICompatibleMcpSdk({});

await metorial.withProviderSession(
  metorialOpenAICompatible,
  {
    serverDeployments: ['...server-deployment-id...']
  },
  async session => {
    // Message history for the chat completion
    let messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'user',
        content:
          'Summarize the README.md file of the metorial/websocket-explorer repository on GitHub?'
      }
    ];

    try {
      // Get next response from OpenAI
      let response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        tools: session.tools as any
      });
      let choice = response.choices[0]!;

      let toolCalls = choice.message.tool_calls;

      // No more tool calls -> we have the final response
      if (!toolCalls || toolCalls.length === 0) {
        console.log('✅ Final response received!');
        console.log(choice.message.content);
        return;
      }

      // Pass tool calls to Metorial
      let toolResponses = await session.callTools(toolCalls);

      // Save the tool call and tool responses to the message history
      messages.push(
        {
          role: 'assistant',
          tool_calls: choice.message.tool_calls
        },
        ...toolResponses
      );
    } catch (error) {
      console.log('⚠️ OpenAI API error:', error.message);
      console.log("💡 This is expected if you haven't provided a valid OpenAI API key.");
      if (error.response) {
        console.log('Error details:', error.response.data);
      }
    }
  }
);
