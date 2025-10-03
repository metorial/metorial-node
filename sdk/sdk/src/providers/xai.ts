import type OpenAI from 'openai';
import { metorialXai } from '@metorial/xai';
import type { WithProviderSessionFunction, RunResult } from './types';

let runWithXAI = async (config: {
  message: string;
  serverDeployments: string | string[];
  client: OpenAI;
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
    ...xaiOptions 
  } = config;

  return withProviderSession(
    metorialXai,
    {
      serverDeployments: Array.isArray(serverDeployments) ? serverDeployments : [serverDeployments]
    },
    async session => {
      let tools = requestedTools
        ? session.tools.filter((t: any) => requestedTools.includes(t.function?.name || t.name))
        : session.tools;

      let uniqueTools = Array.from(
        new Map(tools.map((t: any) => [t.function.name, t])).values()
      );

      let messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'user', content: message }
      ];

      for (let step = 0; step < maxSteps; step++) {
        let response = await client.chat.completions.create({
          model,
          messages,
          tools: uniqueTools,
          ...xaiOptions
        });

        let choice = response.choices[0];
        
        if (!choice.message.tool_calls || choice.message.tool_calls.length === 0) {
          return {
            text: choice.message.content || '',
            steps: step + 1
          };
        }

        let toolResponses = await session.callTools(choice.message.tool_calls);

        messages.push(
          { role: 'assistant', tool_calls: choice.message.tool_calls },
          ...toolResponses
        );
      }

      throw new Error(`Max steps (${maxSteps}) reached without final response`);
    }
  );
}

export { runWithXAI };