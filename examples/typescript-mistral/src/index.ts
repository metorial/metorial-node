import { metorialMistral } from '@metorial/mistral';
import { Metorial } from 'metorial';
import { Mistral } from '@mistralai/mistralai';

// Initialize Metorial
let metorial = new Metorial({
  apiKey: '...your-metorial-api-key...'
});

let mistral = new Mistral({ apiKey: '...your-mistral-api-key...' });

await metorial.withProviderSession(
  metorialMistral,
  { serverDeployments: ['...metorial-server-deployment-id...'] },
  async session => {
    let messages: any[] = [
      {
        role: 'user',
        content:
          'Summarize the README.md file of the metorial/websocket-explorer repository on GitHub.'
      }
    ];

    try {
      // Align the schema to include additionalProperties: false for Mistral compatibility
      let fixedTools = session.tools.map(tool => {
        if (tool.function?.parameters) {
          let fixedParams = { ...tool.function.parameters };
          fixedParams.additionalProperties = false;

          // Also align nested objects
          if (fixedParams.properties) {
            Object.values(fixedParams.properties).forEach((prop: any) => {
              if (prop && typeof prop === 'object' && prop.type === 'object') {
                prop.additionalProperties = false;
              }
            });
          }

          return {
            ...tool,
            function: {
              ...tool.function,
              parameters: fixedParams
            }
          };
        }
        return tool;
      });

      for (let i = 0; i < 10; i++) {
        // Ask Mistral with tools
        let response = await mistral.chat.complete({
          model: 'mistral-large-latest',
          messages,
          tools: fixedTools
        });

        let choice = response.choices[0]!;
        let toolCalls = choice.message.toolCalls;

        // If no more tools to call, print the assistant's reply and exit
        if (!toolCalls || toolCalls.length === 0) {
          console.log(choice.message.content);
          return;
        }

        // Otherwise, invoke them via Metorial and append to history
        let toolResponses = await session.callTools(toolCalls);
        messages.push({ role: 'assistant' as const, toolCalls }, ...toolResponses);
      }

      throw new Error('No final response received after 10 iterations');
    } catch (error) {
      console.log('⚠️ Mistral API error:', error.message);
      if (error.response) {
        console.log('Error details:', error.response.data);
      }
    }
  }
);
