# @metorial/google

Google (Gemini) provider integration for Metorial - enables using Metorial tools with Google's Gemini models through function calling.

## Installation

```bash
npm install @metorial/google
# or
yarn add @metorial/google
# or
pnpm add @metorial/google
# or
bun add @metorial/google
```

## Usage

```typescript
import { metorialGoogle } from '@metorial/google';
import { Metorial } from 'metorial';
import { GoogleGenAI } from '@google/genai';

let metorial = new Metorial({
  apiKey: 'your-metorial-api-key'
});

let genAI = new GoogleGenAI({
  apiKey: 'your-google-api-key'
});

await metorial.withProviderSession(
  metorialGoogle,
  {
    serverDeployments: ['your-server-deployment-id']
  },
  async session => {
    let response = await genAI.models.generateContent({
      model: 'gemini-1.5-pro-latest',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: 'Summarize the README.md file of the metorial/websocket-explorer repository on GitHub.'
            }
          ]
        }
      ],
      config: {
        tools: session.tools
      }
    });

    // Handle function calls and tool responses
    let result = response.response;
    let functionCalls = result.candidates?.[0]?.content?.parts?.filter(
      part => part.functionCall
    );

    if (functionCalls && functionCalls.length > 0) {
      let toolCalls = functionCalls.map(fc => ({
        id: `call_${Date.now()}`,
        type: 'function' as const,
        function: {
          name: fc.functionCall!.name,
          arguments: fc.functionCall!.args
        }
      }));

      let toolResponses = await session.callTools(toolCalls);
      console.log('Tool responses:', toolResponses);
    } else {
      console.log(result.text());
    }
  }
);
```

## License

MIT License - see [LICENSE](../../LICENSE) file for details.
