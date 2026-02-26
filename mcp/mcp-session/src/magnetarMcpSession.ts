import { MetorialMagnetarCoreSDK } from '@metorial/core';
import { SessionsCreateBody } from '@metorial/generated/src/mt_2026_01_01_magnetar';
import { MetorialMcpClient } from './mcpClient';
import { Capability } from './mcpTool';
import { MetorialMcpToolManager } from './mcpToolManager';

export type MetorialMagnetarMcpSessionInitProviders = SessionsCreateBody['providers'];

export type MetorialMagnetarMcpSessionInit = {
  providers: MetorialMagnetarMcpSessionInitProviders;
  client?: {
    name?: string;
    version?: string;
  };
};

export type MetorialMagnetarMcpSessionTemplateInit = {
  sessionTemplate: string;
  client?: {
    name?: string;
    version?: string;
  };
};

type MagnetarSession = Awaited<ReturnType<MetorialMagnetarCoreSDK['sessions']['create']>>;
type MagnetarSessionProvider = MagnetarSession['providers'][number];
type MagnetarProviderDeployment = MagnetarSessionProvider['deployment'];

export class MetorialMagnetarMcpSession {
  #sessionPromise: Promise<MagnetarSession>;
  #clientPromise: Promise<MetorialMcpClient> | null = null;

  constructor(
    private readonly sdk: MetorialMagnetarCoreSDK,
    private readonly init:
      | MetorialMagnetarMcpSessionInit
      | MetorialMagnetarMcpSessionTemplateInit
  ) {
    this.#sessionPromise = this.#createSession();
  }

  async #createSession(): Promise<MagnetarSession> {
    let providers: MetorialMagnetarMcpSessionInitProviders;

    if ('sessionTemplate' in this.init) {
      let templateInit = this.init as MetorialMagnetarMcpSessionTemplateInit;
      let templateProviders = await this.sdk.sessionTemplates.providers.list({
        sessionTemplateId: templateInit.sessionTemplate
      });

      providers = templateProviders.items
        .filter(p => p.deployment?.id)
        .map(p => ({
          providerDeployment: p.deployment!.id,
          sessionTemplateId: templateInit.sessionTemplate
        }));

      if (providers.length === 0) {
        throw new Error('Session template has no provider deployments');
      }
    } else {
      providers = this.init.providers;
    }

    return this.sdk.sessions.create({ providers });
  }

  async getSession(): Promise<MagnetarSession> {
    return await this.#sessionPromise;
  }

  async getProviderDeployments() {
    let session = await this.getSession();
    return session.providers
      .map(provider => provider.deployment)
      .filter((deployment): deployment is MagnetarProviderDeployment => !!deployment?.id);
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
    return MetorialMcpToolManager.fromCapabilities(this as any, await this.getCapabilities());
  }

  async close() {
    if (this.#clientPromise) {
      let client = await this.#clientPromise;
      await client.close();
    }
  }

  private get mcpHost() {
    let config = this.sdk._config;
    if (config.mcpHost) return config.mcpHost;
    let apiHost = config.apiHost ?? 'https://api.metorial.com';
    return apiHost.replace('://api.', '://connect.');
  }

  async getClient(opts?: { deploymentId?: string }) {
    if (!this.#clientPromise) {
      let session = await this.getSession();
      let connectionUrl = `${this.mcpHost}/mcp/${session.id}`;

      this.#clientPromise = MetorialMcpClient.createFromUrl(connectionUrl, {
        clientName: this.init.client?.name,
        clientVersion: this.init.client?.version,
        headers: {
          Authorization: `Bearer ${this.sdk._config.apiKey}`
        }
      });
    }

    return await this.#clientPromise;
  }
}
