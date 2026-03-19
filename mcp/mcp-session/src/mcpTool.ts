import { MetorialSDK } from '@metorial/core';
import { JsonSchema, jsonSchemaToOpenApi } from '@metorial/json-schema';
import { McpUriTemplate } from './lib/mcpUri';
import { slugify } from './lib/slugify';

type SmallServerDeployment =
  MetorialSDK.ServerCapabilities['mcpServers'][number]['serverDeployment'];
type Tool = Omit<MetorialSDK.ServerCapabilities['tools'][number], 'mcpServerId'>;
type ResourceTemplate = Omit<
  MetorialSDK.ServerCapabilities['resourceTemplates'][number],
  'mcpServerId'
>;

export type Capability =
  | {
      type: 'tool';
      tool: Tool;
      serverDeployment: SmallServerDeployment;
    }
  | {
      type: 'resource-template';
      resourceTemplate: ResourceTemplate;
      serverDeployment: SmallServerDeployment;
    };

type JsonSchemaRecord = Record<string, unknown>;

let stripMetaKeywords = (schema: JsonSchema): JsonSchema => {
  if (!schema || typeof schema !== 'object') return schema;
  let { $schema, $id, $defs, definitions, ...rest } = schema as JsonSchemaRecord;
  if (rest.properties) {
    rest.properties = Object.fromEntries(
      Object.entries(rest.properties as Record<string, JsonSchema>).map(([k, v]) => [
        k,
        stripMetaKeywords(v)
      ])
    );
  }
  if (rest.items) rest.items = stripMetaKeywords(rest.items as JsonSchema);
  if (rest.allOf) rest.allOf = (rest.allOf as JsonSchema[]).map(stripMetaKeywords);
  if (rest.anyOf) rest.anyOf = (rest.anyOf as JsonSchema[]).map(stripMetaKeywords);
  if (rest.oneOf) rest.oneOf = (rest.oneOf as JsonSchema[]).map(stripMetaKeywords);
  return rest as JsonSchema;
};

let enforceStrictSchema = (schema: JsonSchema): JsonSchema => {
  if (!schema || typeof schema !== 'object') return schema;
  let { format, ...result } = schema as JsonSchemaRecord;
  if (result.type === 'object') {
    result.additionalProperties = false;
    if (result.properties) {
      let props = result.properties as Record<string, JsonSchema>;
      result.required = Object.keys(props);
      result.properties = Object.fromEntries(
        Object.entries(props).map(([k, v]) => [k, enforceStrictSchema(v)])
      );
    }
  }
  if (result.items) result.items = enforceStrictSchema(result.items as JsonSchema);
  if (result.allOf) result.allOf = (result.allOf as JsonSchema[]).map(enforceStrictSchema);
  if (result.anyOf) result.anyOf = (result.anyOf as JsonSchema[]).map(enforceStrictSchema);
  if (result.oneOf) result.oneOf = (result.oneOf as JsonSchema[]).map(enforceStrictSchema);
  return result as JsonSchema;
};

const MAX_RETRIES = 10;

let runWithRetries = async <T>(
  action: () => Promise<T>,
  retries: number = MAX_RETRIES
): Promise<T> => {
  let err: Error | undefined;

  for (let i = 0; i < retries; i++) {
    try {
      return await action();
    } catch (error) {
      err = error as Error;
    }
  }

  throw err!;
};

export class MetorialMcpTool {
  #id: string;
  #name: string;
  #description: string | null;
  #parameters: JsonSchema;

  private constructor(
    private readonly session: any,
    opts: {
      id: string;
      name: string;
      description: string | null;
      parameters: JsonSchema;
    },
    private readonly action: (args: any) => Promise<any>
  ) {
    this.#id = opts.id;
    this.#name = opts.name;
    this.#description = opts.description;
    this.#parameters = opts.parameters;
  }

  get name() {
    return this.#name;
  }

  get id() {
    return this.#id;
  }

  get description() {
    return this.#description;
  }

  get parameters() {
    return this.#parameters;
  }

  async call(args: any) {
    return await this.action(args);
  }

  getParametersAs(
    as:
      | 'json-schema'
      | 'strict-json-schema'
      | 'openapi-3.0.0'
      | 'openapi-3.1.0' = 'json-schema'
  ) {
    if (as == 'json-schema') {
      return stripMetaKeywords(this.#parameters);
    }

    if (as == 'strict-json-schema') {
      return enforceStrictSchema(stripMetaKeywords(this.#parameters));
    }

    if (as == 'openapi-3.0.0' || as == 'openapi-3.1.0') {
      return jsonSchemaToOpenApi(this.#parameters, {
        openApiVersion: as == 'openapi-3.0.0' ? '3.0.0' : '3.1.0',
        preserveJsonSchemaKeywords: false,
        nullHandling: 'nullable'
      });
    }

    throw new Error(`[METORIAL MCP]: Unknown parameters format: ${as}`);
  }

  static fromTool(session: any, capability: Capability) {
    if (capability.type !== 'tool') {
      throw new Error(
        `[METORIAL MCP]: Expected capability type to be 'tool', got '${capability.type}'`
      );
    }

    let { tool, serverDeployment } = capability;

    return new MetorialMcpTool(
      session,
      {
        id: slugify(tool.name),
        name: tool.name,
        description: tool.description ?? null,
        parameters: tool.inputSchema
      },
      async params =>
        runWithRetries(async () => {
          let client = await session.getClient({
            deploymentId: serverDeployment!.id
          });

          let result = await client.callTool({
            name: tool.name,
            arguments: params
          });

          return result;
        }, MAX_RETRIES)
    );
  }

  static fromResourceTemplate(session: any, capability: Capability) {
    if (capability.type !== 'resource-template') {
      throw new Error(
        `[METORIAL MCP]: Expected capability type to be 'resource-template', got '${capability.type}'`
      );
    }

    let { resourceTemplate, serverDeployment } = capability;

    let uri = new McpUriTemplate(resourceTemplate.uriTemplate);

    return new MetorialMcpTool(
      session,
      {
        id: slugify(resourceTemplate.name),
        name: resourceTemplate.name,
        description: resourceTemplate.description ?? null,
        parameters: {
          type: 'object',
          properties: Object.fromEntries(
            uri.getProperties().map(prop => [prop.key, { type: 'string' }])
          ),
          required: uri
            .getProperties()
            .filter(prop => !prop.optional)
            .map(prop => prop.key),
          additionalProperties: false
        }
      },
      async params =>
        runWithRetries(async () => {
          let client = await session.getClient({
            deploymentId: serverDeployment!.id
          });

          let finalUri = uri.expand(params);

          let result = await client.readResource({
            uri: finalUri
          });

          return result;
        }, MAX_RETRIES)
    );
  }

  static fromCapability(session: any, capability: Capability): MetorialMcpTool {
    if (capability.type === 'tool') {
      return MetorialMcpTool.fromTool(session, capability);
    }

    if (capability.type === 'resource-template') {
      return MetorialMcpTool.fromResourceTemplate(session, capability);
    }

    throw new Error(
      `[METORIAL MCP]: Unknown capability type: ${capability}. Expected 'tool' or 'resource-template'.`
    );
  }
}
