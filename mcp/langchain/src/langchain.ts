import type { StructuredToolInterface } from '@langchain/core/tools';
import type { JsonSchema7Type } from '@langchain/core/utils/json_schema';
import { createMcpSdk } from '@metorial/mcp-sdk-utils';
import { tool } from 'langchain';

export type MetorialLangchainSession = {
  tools: () => StructuredToolInterface[];
};

export let metorialLangchain = createMcpSdk(
  async ({ tools }): Promise<MetorialLangchainSession> => ({
    tools: () =>
      tools.getTools().map(t => {
        let parameters = t.getParametersAs('json-schema');

        if (parameters && typeof parameters === 'object' && !parameters.type) {
          parameters.type = 'object';
        }

        if (!parameters) {
          parameters = { type: 'object', properties: {} };
        }

        if (typeof parameters === 'boolean') {
          throw new Error(`Tool "${t.name}" has an unsupported boolean JSON Schema value`);
        }

        let schema = parameters as JsonSchema7Type;

        return tool(
          async params => {
            return await t.call(params);
          },
          {
            name: t.name,
            description: t.description ?? undefined,
            schema
          }
        ) as StructuredToolInterface;
      })
  })
);
