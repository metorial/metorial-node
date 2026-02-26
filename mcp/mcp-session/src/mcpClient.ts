import { MetorialSDK } from '@metorial/core';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { RequestOptions } from '@modelcontextprotocol/sdk/shared/protocol.js';
import {
  CallToolRequest,
  CallToolResult,
  CallToolResultSchema,
  ClientCapabilities,
  CompatibilityCallToolResultSchema,
  CompleteRequest,
  CompleteResult,
  GetPromptRequest,
  GetPromptResult,
  ListPromptsRequest,
  ListPromptsResult,
  ListResourcesRequest,
  ListResourcesResult,
  ListResourceTemplatesRequest,
  ListResourceTemplatesResult,
  ListToolsRequest,
  ListToolsResult,
  LoggingLevel,
  ReadResourceRequest,
  ReadResourceResult,
  SetLevelRequest
} from '@modelcontextprotocol/sdk/types.js';

export class MetorialMcpClient {
  private constructor(private readonly client: Client) {}

  static async create(
    session: MetorialSDK.Session,
    opts: {
      host: string;
      deploymentId: string;
      clientName?: string;
      clientVersion?: string;
    }
  ) {
    let client = new Client({
      name: opts?.clientName ?? 'metorial-js-client',
      version: opts?.clientVersion ?? '1.0.0'
    });

    let transport = new SSEClientTransport(
      new URL(
        `/mcp/${session.id}/${opts.deploymentId}/sse?key=${session.clientSecret.secret}`,
        opts.host
      )
    );

    await client.connect(transport);

    return new MetorialMcpClient(client);
  }

  static async createFromUrl(
    connectionUrl: string,
    opts?: {
      clientName?: string;
      clientVersion?: string;
      headers?: Record<string, string>;
    }
  ) {
    let client = new Client({
      name: opts?.clientName ?? 'metorial-js-client',
      version: opts?.clientVersion ?? '1.0.0'
    });

    let transport = new StreamableHTTPClientTransport(new URL(connectionUrl), {
      requestInit: opts?.headers ? { headers: opts.headers } : undefined
    });

    await client.connect(transport);

    return new MetorialMcpClient(client);
  }

  public registerCapabilities(capabilities: ClientCapabilities) {
    return this.client.registerCapabilities(capabilities);
  }

  public getServerCapabilities() {
    return this.client.getServerCapabilities()!;
  }

  public getServerVersion() {
    return this.client.getServerVersion()!;
  }

  public getInstructions() {
    return this.client.getInstructions();
  }

  complete(params: CompleteRequest['params'], options?: RequestOptions): Promise<CompleteResult> {
    return this.client.complete(params, options);
  }

  setLoggingLevel(level: LoggingLevel, options?: RequestOptions): Promise<object> {
    return this.client.setLoggingLevel(level, options);
  }

  getPrompt(params: GetPromptRequest['params'], options?: RequestOptions): Promise<GetPromptResult> {
    return this.client.getPrompt(params, options);
  }

  listPrompts(params?: ListPromptsRequest['params'], options?: RequestOptions): Promise<ListPromptsResult> {
    return this.client.listPrompts(params, options);
  }

  listResources(params?: ListResourcesRequest['params'], options?: RequestOptions): Promise<ListResourcesResult> {
    return this.client.listResources(params, options);
  }

  listResourceTemplates(
    params?: ListResourceTemplatesRequest['params'],
    options?: RequestOptions
  ): Promise<ListResourceTemplatesResult> {
    return this.client.listResourceTemplates(params, options);
  }

  readResource(params: ReadResourceRequest['params'], options?: RequestOptions): Promise<ReadResourceResult> {
    return this.client.readResource(params, options);
  }

  callTool(
    params: CallToolRequest['params'],
    resultSchema:
      | typeof CallToolResultSchema
      | typeof CompatibilityCallToolResultSchema = CallToolResultSchema,
    options?: RequestOptions
  ): Promise<any> {
    return this.client.callTool(params, resultSchema, options);
  }

  listTools(params?: ListToolsRequest['params'], options?: RequestOptions): Promise<ListToolsResult> {
    return this.client.listTools(params, options);
  }

  sendRootsListChanged() {
    return this.client.sendRootsListChanged();
  }

  close() {
    return this.client.close();
  }
}
