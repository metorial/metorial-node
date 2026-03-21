import { MetorialCoreSDK } from '@metorial/core';
import { SessionsCreateBody } from '@metorial/generated/src/mt_2026_01_01_magnetar';
import { MetorialMcpClient } from './mcpClient';
import { Capability } from './mcpTool';
import { MetorialMcpToolManager } from './mcpToolManager';
export type MetorialMcpSessionInitProviders = SessionsCreateBody['providers'];

export type MetorialMcpSessionInit = {
  providers: MetorialMcpSessionInitProviders;
  client?: {
    name?: string;
    version?: string;
  };
};

type MetorialSession = Awaited<ReturnType<MetorialCoreSDK['sessions']['create']>>;
type MetorialSessionProvider = MetorialSession['providers'][number];
type MetorialProviderDeployment = MetorialSessionProvider['deployment'];

export class MetorialMcpSession {
  #sessionPromise: Promise<MetorialSession>;
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

  async #createSession(): Promise<MetorialSession> {
    return this.sdk.sessions.create({ providers: this.init.providers });
  }

  async getSession(): Promise<MetorialSession> {
    return await this.#sessionPromise;
  }

  async getProviderDeployments() {
    let session = await this.getSession();
    return session.providers
      .map(provider => provider.deployment)
      .filter((deployment): deployment is MetorialProviderDeployment => !!deployment?.id);
  }

  async getCapabilities(): Promise<Capability[]> {
    let client = await this.getClient();
    let capabilities: Capability[] = [];

    let deployments = await this.getProviderDeployments();

    try {
      let tools = await client.listTools();

      capabilities.push(
        ...tools.tools.map(tool => ({
          type: 'tool' as const,
          tool: {
            name: tool.name,
            description: tool.description,
            inputSchema: tool.inputSchema
          },
          serverDeployment: deployments[0] as any
        }))
      );
    } catch (error) {
      // Server may not support tool listing
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
          },
          serverDeployment: deployments[0] as any
        }))
      );
    } catch (error) {
      // Server may not support resource templates
    }

    return capabilities;
  }

  async getToolManager() {
    return MetorialMcpToolManager.fromCapabilities(this, await this.getCapabilities());
  }

  async close() {
    // noop — session cleanup is handled by the server
  }

  async getClient(opts?: { deploymentId?: string }) {
    if (!this.#clientPromise) {
      let session = await this.getSession();
      let connectionUrl = `${session.connectionUrl}?key=${session.clientSecret}`;

      this.#clientPromise = MetorialMcpClient.createFromUrl(connectionUrl, {
        clientName: this.init.client?.name,
        clientVersion: this.init.client?.version
      });
    }

    return await this.#clientPromise;
  }
}
