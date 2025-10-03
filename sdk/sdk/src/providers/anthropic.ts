import type Anthropic from '@anthropic-ai/sdk';
import { metorialAnthropic } from '@metorial/anthropic';
import type { WithProviderSessionFunction, RunResult } from './types';

interface ToolResultBlock {
  type: 'tool_result';
  tool_use_id: string;
  content: string;
}

interface ToolResponseMessage {
  role: 'user';
  content: ToolResultBlock[];
}

let runWithAnthropic = async (config: {
  message: string;
  serverDeployments: string | string[];
  client: Anthropic;
  model: string;
  maxSteps?: number;
  tools?: string[];
  withProviderSession: WithProviderSessionFunction;
  max_tokens?: number;
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
    max_tokens = 4096,
    ...anthropicOptions 
  } = config;

  return withProviderSession(
    metorialAnthropic,
    {
      serverDeployments: Array.isArray(serverDeployments) ? serverDeployments : [serverDeployments]
    },
    async session => {
      let tools: Anthropic.Tool[] = requestedTools
        ? (session.tools as Anthropic.Tool[]).filter(t => requestedTools.includes(t.name))
        : session.tools as Anthropic.Tool[];

      let messages: Anthropic.Messages.MessageParam[] = [
        { role: 'user', content: message }
      ];

      let uniqueTools = Array.from(new Map(tools.map(t => [t.name, t])).values());

      for (let step = 0; step < maxSteps; step++) {
        let response = await client.messages.create({
          model,
          max_tokens,
          messages,
          tools: uniqueTools,
          ...anthropicOptions
        });

        if (response.stop_reason !== 'tool_use') {
          let textContent = response.content.find(
            (block): block is Anthropic.Messages.TextBlock => block.type === 'text'
          );
          return {
            text: textContent?.text || '',
            steps: step + 1
          };
        }

        let toolUseBlocks = response.content.filter(
          (block): block is Anthropic.Messages.ToolUseBlock => block.type === 'tool_use'
        );
        let toolResponse = await session.callTools(toolUseBlocks) as ToolResponseMessage;

        let toolResponseMessage: Anthropic.Messages.MessageParam = {
          role: 'user',
          content: toolResponse.content.map(block => ({
            type: 'tool_result' as const,
            tool_use_id: block.tool_use_id,
            content: block.content
          } as Anthropic.Messages.ToolResultBlockParam))
        };

        messages.push(
          { role: 'assistant', content: response.content },
          toolResponseMessage
        );
      }

      throw new Error(`Max steps (${maxSteps}) reached without final response`);
    }
  );
}

export { runWithAnthropic };