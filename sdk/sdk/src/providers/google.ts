import type { GoogleGenAI } from '@google/genai';
import { metorialGoogle } from '@metorial/google';
import type { WithProviderSessionFunction, RunResult } from './types';

let runWithGoogle = async (config: {
  message: string;
  serverDeployments: string | string[];
  client: GoogleGenAI;
  model: string;
  maxSteps?: number;
  tools?: string[];
  withProviderSession: WithProviderSessionFunction;
  [key: string]: any;
}): Promise<RunResult> => {
  let { 
    message, 
    serverDeployments, 
    client, 
    model, 
    maxSteps = 25, 
    tools: requestedTools,
    withProviderSession,
    ...googleOptions 
  } = config;

  return withProviderSession(
    metorialGoogle,
    {
      serverDeployments: Array.isArray(serverDeployments) ? serverDeployments : [serverDeployments]
    },
    async session => {
      let tools = requestedTools
        ? session.tools.filter((t: any) => requestedTools.includes(t.name))
        : session.tools;

      let response = await client.models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [{ text: message }]
          }
        ],
        config: {
          tools,
          ...googleOptions
        }
      });

      let text = response.candidates?.[0]?.content?.parts?.[0]?.text;
      
      let functionCalls = response.candidates?.[0]?.content?.parts
        ?.filter((part: any) => part.functionCall)
        .map((part: any) => part.functionCall);

      if (functionCalls && functionCalls.length > 0) {
        let toolResponses = await session.callTools(functionCalls);
        
        return {
          text: text || '',
          toolResponses: toolResponses as any,
          steps: 1
        };
      }

      return {
        text: text || '',
        steps: 1
      };
    }
  );
}

export { runWithGoogle };