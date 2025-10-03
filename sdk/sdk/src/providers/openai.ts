import type OpenAI from 'openai';
import { metorialOpenAI } from '@metorial/openai';
import type { WithProviderSessionFunction, RunResult } from './types';

let runWithOpenAI = async (config: {
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
    ...openaiOptions 
  } = config;

  return withProviderSession(
    metorialOpenAI.chatCompletions,
    {
      serverDeployments: Array.isArray(serverDeployments) ? serverDeployments : [serverDeployments]
    },
    async session => {
      let tools = requestedTools
        ? session.tools.filter((t: any) => requestedTools.includes(t.name))
        : session.tools;

      let messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'user', content: message }
      ];

      for (let step = 0; step < maxSteps; step++) {
        let response = await client.chat.completions.create({
          model,
          messages,
          tools,
          ...openaiOptions
        });

        let choice = response.choices[0];
        
        if (!choice.message.tool_calls) {
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

export { runWithOpenAI };