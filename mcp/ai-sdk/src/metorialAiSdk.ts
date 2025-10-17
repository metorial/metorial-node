import { MetorialMcpSession } from '@metorial/mcp-session';
import { jsonSchema, tool } from 'ai';

export let metorialAiSdk = async (session: MetorialMcpSession) => {
  let toolManager = await session.getToolManager();
  let toolMap: Record<string, any> = {};

  for (let t of toolManager.getTools()) {
    let parameters = t.getParametersAs('json-schema') as any;
    
    if (parameters && typeof parameters === 'object' && !parameters.type) {
      parameters.type = 'object';
    }
    
    if (!parameters) {
      parameters = { type: 'object', properties: {} };
    }

    toolMap[t.id] = tool({
      description: t.description ?? undefined,
      inputSchema: jsonSchema(parameters),
      execute: async (params: any) => {
        return await t.call(params);
      }
    });
  }

  return { tools: toolMap };
};
