import type { Mistral } from '@mistralai/mistralai';
import { metorialMistral } from '@metorial/mistral';
import type { MetorialMcpSessionInitServerDeployments } from '@metorial/mcp-session';
import type { WithProviderSessionFunction, RunResult } from './types';

let extractTextFromContent = (content: unknown): string => {
  if (typeof content === 'string') {
    return content;
  }
  
  if (Array.isArray(content)) {
    return content
      .filter((chunk: any) => chunk && typeof chunk === 'object')
      .map((chunk: any) => chunk.text || chunk.content || JSON.stringify(chunk))
      .join('');
  }
  
  return '';
}

let runWithMistral = async (config: {
  message: string;
  serverDeployments: string | MetorialMcpSessionInitServerDeployments;
  client: Mistral;
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
    ...mistralOptions 
  } = config;

  return withProviderSession(
    metorialMistral,
    {
      serverDeployments: Array.isArray(serverDeployments) ? serverDeployments : [serverDeployments]
    },
    async session => {
      let tools = requestedTools
        ? session.tools.filter((t: any) => requestedTools.includes(t.function?.name || t.name))
        : session.tools;

      // Fix tools for Mistral compatibility: add additionalProperties: false
      let fixedTools = tools.map((tool: any) => {
        if (tool.function?.parameters) {
          let fixedParams = { ...tool.function.parameters };
          fixedParams.additionalProperties = false;

          // Also fix nested objects
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
        { role: 'user', content: message }
      ];

      for (let step = 0; step < maxSteps; step++) {
        let response = await client.chat.complete({
          model,
          messages,
          tools: fixedTools,
          ...mistralOptions
        });

        let choice = response.choices[0];
        let toolCalls = choice.message.toolCalls;
        
        if (!toolCalls || toolCalls.length === 0) {
          return {
            text: extractTextFromContent(choice.message.content),
            steps: step + 1
          };
        }

        let toolResponses = await session.callTools(toolCalls);

        messages.push(
          { role: 'assistant', toolCalls },
          ...toolResponses
        );
      }

      throw new Error(`Max steps (${maxSteps}) reached without final response`);
    }
  );
}

export { runWithMistral };