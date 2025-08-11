# @metorial/mistral

Mistral AI provider integration for Metorial - enables using Metorial tools with Mistral's language models through function calling.

## Installation

```bash
npm install @metorial/mistral
# or
yarn add @metorial/mistral
# or
pnpm add @metorial/mistral
# or
bun add @metorial/mistral
```

## Usage

```typescript
import { metorialMistral } from '@metorial/mistral';
import { Metorial } from 'metorial';
import { Mistral } from '@mistralai/mistralai';

let metorial = new Metorial({
  apiKey: 'your-metorial-api-key'
});

let mistral = new Mistral({
  apiKey: 'your-mistral-api-key'
});

await metorial.withProviderSession(
  metorialMistral,
  {
    serverDeployments: ['your-server-deployment-id']
  },
  async session => {
    // make tools Mistral compatibility
    let fixedTools = session.tools.map(tool => {
      if (tool.function?.parameters) {
        let fixedParams = { ...tool.function.parameters };
        fixedParams.additionalProperties = false;

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

    let messages: any[] = [
      {
        role: 'user',
        content:
          'Summarize the README.md file of the metorial/websocket-explorer repository on GitHub?'
      }
    ];

    let response = await mistral.chat.complete({
      model: 'mistral-large-latest',
      messages,
      tools: fixedTools
    });

    let choice = response.choices[0];
    let toolCalls = choice.message.toolCalls;

    if (toolCalls && toolCalls.length > 0) {
      let toolResponses = await session.callTools(toolCalls);
      console.log('Tool responses:', toolResponses);
    } else {
      console.log(choice.message.content);
    }
  }
);
```

## License

MIT License - see [LICENSE](../../LICENSE) file for details.
