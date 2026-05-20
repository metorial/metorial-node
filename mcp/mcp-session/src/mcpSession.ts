import { MetorialCoreSDK, MetorialSDK } from '@metorial/core';
import { SessionsCreateBody } from '@metorial/generated';
import { MetorialSDKError } from '@metorial/util-endpoint';
import { MetorialMcpClient } from './mcpClient';
import { Capability } from './mcpTool';
import { MetorialMcpToolManager } from './mcpToolManager';

export type MetorialMcpSessionInitProviders = SessionsCreateBody['providers'];

export type MetorialMcpSessionInitInput =
  | {
      providers: MetorialMcpSessionInitProviders;
    }
  | {
      sessionTemplateId: string;
    }
  | {
      integrationInstanceId: string;
    }
  | {
      integrationInstanceGroupId: string;
    }
  | {
      magicMcpServerId: string;
    };

export type MetorialMcpSessionInit = MetorialMcpSessionInitInput & {
  client?: {
    name?: string;
    version?: string;
  };
};

type MetorialMcpConnectionSession =
  | {
      type: 'session';
      url: string;
      id: string;
    }
  | {
      type: 'magic_mcp_server';
      url: string;
    };

export class MetorialMcpSession {
  #sessionPromise: Promise<MetorialMcpConnectionSession>;
  #clientPromise: Promise<MetorialMcpClient> | null = null;

  static async create(
    sdk: MetorialCoreSDK,
    init: MetorialMcpSessionInit
  ): Promise<MetorialMcpSession> {
    return new MetorialMcpSession(sdk, init);
  }

  constructor(
    private readonly sdk: MetorialCoreSDK,
    private readonly init: MetorialMcpSessionInit
  ) {
    this.#sessionPromise = this.#createSession();
  }

  async #createSession(): Promise<MetorialMcpConnectionSession> {
    if ('sessionTemplateId' in this.init) {
      return this.encodeSession(
        await this.sdk.sessions.create({
          providers: [
            {
              sessionTemplateId: this.init.sessionTemplateId
            }
          ]
        })
      );
    }

    if ('integrationInstanceId' in this.init) {
      return this.encodeSession(
        await this.sdk.integrations.instances.createSession(
          this.init.integrationInstanceId,
          {}
        )
      );
    }

    if ('integrationInstanceGroupId' in this.init) {
      return this.encodeSession(
        await this.sdk.integrations.instanceGroups.createSession(
          this.init.integrationInstanceGroupId,
          {}
        )
      );
    }

    if ('providers' in this.init) {
      return this.encodeSession(
        await this.sdk.sessions.create({ providers: this.init.providers })
      );
    }

    if ('magicMcpServerId' in this.init) {
      let magicMcpServer = await this.sdk.magicMcp.servers.get(this.init.magicMcpServerId);
      let endpoint = magicMcpServer.endpoints[0];
      if (!endpoint) {
        throw new MetorialSDKError({
          status: 400,
          code: 'no_magic_mcp_server_endpoint',
          message: 'The specified magic MCP server does not have any endpoints'
        });
      }

      return {
        type: 'magic_mcp_server',
        url: endpoint.url
      };
    }

    throw new Error('Invalid session initialization parameters');
  }

  async getSession(): Promise<MetorialSDK.Session> {
    let session = await this.getSessionInternal();
    if (session.type === 'magic_mcp_server') {
      throw new MetorialSDKError({
        status: 400,
        code: 'invalid_session_type',
        message: 'Session is a magic MCP server and cannot be used directly'
      });
    }

    return await this.sdk.sessions.get(session.id);
  }

  async getCapabilities(): Promise<Capability[]> {
    let client = await this.getClient();
    let capabilities: Capability[] = [];

    try {
      let tools = await client.listTools();

      capabilities.push(
        ...tools.tools.map(tool => ({
          type: 'tool' as const,
          tool: {
            name: tool.name,
            description: tool.description,
            inputSchema: tool.inputSchema
          }
        }))
      );
    } catch (error) {
      // Provider may not support tool listing
    }

    try {
      let resourceTemplates = await client.listResourceTemplates();

      capabilities.push(
        ...resourceTemplates.resourceTemplates.map(resourceTemplate => ({
          type: 'resource-template' as const,
          resourceTemplate: {
            name: resourceTemplate.name,
            description: resourceTemplate.description,
            uriTemplate: resourceTemplate.uriTemplate
          }
        }))
      );
    } catch (error) {
      // Provider may not support resource templates
    }

    return capabilities;
  }

  async getToolManager() {
    return MetorialMcpToolManager.fromCapabilities(this, await this.getCapabilities());
  }

  async close() {
    // Transport is connectionless so no cleanup is necessary
  }

  async getClient() {
    if (!this.#clientPromise) {
      let session = await this.getSessionInternal();

      this.#clientPromise = MetorialMcpClient.createFromUrl(session.url, {
        clientName: this.init.client?.name,
        clientVersion: this.init.client?.version,
        headers: {
          Authorization: `Bearer ${this.sdk._config.apiKey}`
        }
      });
    }

    return await this.#clientPromise;
  }

  private async getSessionInternal(): Promise<MetorialMcpConnectionSession> {
    return await this.#sessionPromise;
  }

  private async encodeSession(
    session: MetorialSDK.Session
  ): Promise<MetorialMcpConnectionSession> {
    let url = new URL(session.connectionUrl);
    if (session.clientSecret) url.searchParams.set('key', session.clientSecret);

    return {
      type: 'session',
      id: session.id,
      url: url.toString()
    };
  }
}
