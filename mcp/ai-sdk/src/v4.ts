import { createMcpSdk } from '@metorial/mcp-sdk-utils';
import { jsonSchema, Tool, tool } from 'ai';

export let metorialAiSdk = createMcpSdk()(async ({ tools }) => ({
  tools: Object.fromEntries([
    ...tools.getTools().map(t => {
      let parameters = t.getParametersAs('json-schema') as any;
      
      if (parameters && typeof parameters === 'object' && !parameters.type) {
        parameters.type = 'object';
      }
      
      if (!parameters) {
        parameters = { type: 'object', properties: {} };
      }

      return [
        t.id,
        tool({
          description: t.description ?? undefined,
          inputSchema: jsonSchema(parameters),
          execute: async (params: any) => {
            return await t.call(params);
          }
        })
      ];
    })
  ]) as Record<string, Tool>
}));