import { createMcpSdk } from '@metorial/mcp-sdk-utils';
import { tool } from 'langchain';

export let metorialLangchain = createMcpSdk(async ({ tools }) => ({
  tools: () => tools.getTools().map(t => {
    let parameters = t.getParametersAs('json-schema');

    if (parameters && typeof parameters === 'object' && !parameters.type) {
      parameters.type = 'object';
    }

    if (!parameters) {
      parameters = { type: 'object', properties: {} };
    }

    return tool(
      async (params: any) => {
        return await t.call(params);
      },
      {
        name: t.name,
        description: t.description ?? undefined,
        schema: (() => {
          if (typeof parameters === 'boolean') {
            throw new Error(`Tool "${t.name}" has an unsupported boolean JSON Schema value`);
          }
          return parameters;
        })()
      }
    );
  })
}));
