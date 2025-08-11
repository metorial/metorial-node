import { metorialGoogle } from '@metorial/google';
import { Metorial } from 'metorial';
import { GoogleGenAI } from '@google/genai';

let metorial = new Metorial({ apiKey: '...your-metorial-api-key...' });

let genAI = new GoogleGenAI({ apiKey: '...your-google-gen-api-key...' });

await metorial.withProviderSession(
  metorialGoogle,
  { serverDeployments: ['...server-deployment-id...'] },
  async session => {
    try {
      let response = await genAI.models.generateContent({
        model: 'gemini-1.5-pro-latest',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: 'Search for information about the metorial/websocket-explorer repository on GitHub'
              }
            ]
          }
        ],
        config: {
          tools: session.tools
        }
      });

      let text = response.candidates?.[0]?.content?.parts?.[0]?.text;

      // Check for function calls
      let functionCalls = response.candidates?.[0]?.content?.parts
        ?.filter(part => part.functionCall)
        .map(part => part.functionCall!);

      if (functionCalls && functionCalls.length > 0) {
        let toolResponses = await session.callTools(functionCalls);
        console.log('✅ Tool responses:', toolResponses);
      }
    } catch (error) {
      console.error('❌ Error during generation:', error);
    }
  }
);
