import { createMcpSdk } from '@metorial/mcp-sdk-utils';
import { jsonSchema } from 'ai';

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
        {
          description: t.description ?? undefined,
          parameters: jsonSchema(parameters),
          execute: async (params: Record<string, unknown>) => {
            return await t.call(params);
          }
        }
      ];
    })
  ])
}));
