import {
  MetorialPulsarCoreSDK,
  createMetorialPulsarCoreSDK,
  MetorialMagnetarCoreSDK,
  createMetorialMagnetarCoreSDK
} from '@metorial/core';
import {
  MetorialMcpSession,
  MetorialMcpSessionInit,
  MetorialMcpSessionInitServerDeployments,
  MetorialMagnetarMcpSession,
  MetorialMagnetarMcpSessionInit,
  MetorialMagnetarMcpSessionTemplateInit
} from '@metorial/mcp-session';

export type {
  MetorialMcpSession,
  MetorialMcpSessionInit,
  MetorialMcpSessionInitServerDeployments,
  MetorialMagnetarMcpSession,
  MetorialMagnetarMcpSessionInit,
  MetorialMagnetarMcpSessionTemplateInit
} from '@metorial/mcp-session';

export class Metorial {
  private readonly pulsarSdk: MetorialPulsarCoreSDK;
  private readonly magnetarSdk: MetorialMagnetarCoreSDK;

  constructor(init: Omit<Parameters<typeof createMetorialPulsarCoreSDK>[0], 'apiVersion'>) {
    let apiHost = init.apiHost;
    let mcpHost = init.mcpHost;

    // Derive apiHost from mcpHost if only mcpHost is provided
    if (mcpHost && !apiHost) {
      apiHost = mcpHost.replace('://connect.', '://api.');
    }

    // v1 (pulsar): mcp.<domain> pattern — let mcpSession.ts derive it from apiHost
    this.pulsarSdk = createMetorialPulsarCoreSDK({ ...init, apiHost });

    // v2 (magnetar): connect.<domain> pattern
    this.magnetarSdk = createMetorialMagnetarCoreSDK({ ...init, apiHost, mcpHost });
  }

  // ── Magnetar (default) ───────────────────────────────────────────

  get providers() {
    return this.magnetarSdk.providers;
  }

  get providerDeployments() {
    let deployments = this.magnetarSdk.providerDeployments;
    Object.assign(deployments.setupSessions, {
      waitForCompletion: this.waitForSetupSession.bind(this)
    });
    return deployments;
  }

  get sessions() {
    return this.magnetarSdk.sessions;
  }

  get sessionTemplates() {
    return this.magnetarSdk.sessionTemplates;
  }

  get providerRuns() {
    return this.magnetarSdk.providerRuns;
  }

  get instance() {
    return this.magnetarSdk.instance;
  }

  get publishers() {
    return this.magnetarSdk.publishers;
  }

  get providerCategories() {
    return this.magnetarSdk.providerCategories;
  }

  get providerCollections() {
    return this.magnetarSdk.providerCollections;
  }

  get providerGroups() {
    return this.magnetarSdk.providerGroups;
  }

  get providerListings() {
    return this.magnetarSdk.providerListings;
  }

  get providerSetupSessions() {
    return this.magnetarSdk.providerSetupSessions;
  }

  get toolCalls() {
    return this.magnetarSdk.toolCalls;
  }

  get customProviders() {
    return this.magnetarSdk.customProviders;
  }

  // ── Backward compat (Pulsar endpoints at top level) ──────────────

  get servers() {
    return this.pulsarSdk.servers;
  }

  get secrets() {
    return this.pulsarSdk.secrets;
  }

  get oauth(): typeof this.pulsarSdk.oauth & {
    waitForCompletion: (
      sessions: Array<{ id: string }>,
      options?: {
        pollInterval?: number;
        timeout?: number;
      }
    ) => Promise<void>;
  } {
    return {
      ...this.pulsarSdk.oauth,
      waitForCompletion: this.waitForOAuthCompletion.bind(this)
    };
  }

  get _config() {
    return this.pulsarSdk._config;
  }

  // ── v1 namespace (legacy Pulsar) ─────────────────────────────────

  get v1() {
    let pulsarSdk = this.pulsarSdk;
    let self = this;
    return {
      get instance() {
        return pulsarSdk.instance;
      },
      get secrets() {
        return pulsarSdk.secrets;
      },
      get servers() {
        return pulsarSdk.servers;
      },
      get sessions() {
        return pulsarSdk.sessions;
      },
      get oauth() {
        return self.oauth;
      },
      get _config() {
        return pulsarSdk._config;
      },
      mcp: {
        createSession: (init: MetorialMcpSessionInit) =>
          new MetorialMcpSession(pulsarSdk, init),
        withSession: self._pulsarWithSession.bind(self),
        withProviderSession: self._pulsarWithProviderSession.bind(self),
        createConnection: self._pulsarCreateMcpConnection.bind(self)
      },
      withSession: self._pulsarWithSession.bind(self),
      withProviderSession: self._pulsarWithProviderSession.bind(self),
      createMcpConnection: self._pulsarCreateMcpConnection.bind(self)
    };
  }

  // ── MCP (Magnetar default) ───────────────────────────────────────

  get mcp() {
    return {
      createSession: (init: MetorialMagnetarMcpSessionInit | MetorialMagnetarMcpSessionTemplateInit) =>
        new MetorialMagnetarMcpSession(this.magnetarSdk, init),
      withSession: this.withSession.bind(this),
      withProviderSession: this.withProviderSession.bind(this),
      createConnection: this.createMcpConnection.bind(this)
    };
  }

  session(
    init: MetorialMagnetarMcpSessionInit | MetorialMagnetarMcpSessionTemplateInit
  ): MetorialMagnetarMcpSession {
    return new MetorialMagnetarMcpSession(this.magnetarSdk, init);
  }

  async createMcpConnection(
    init: MetorialMagnetarMcpSessionInit | MetorialMagnetarMcpSessionTemplateInit
  ) {
    let session = new MetorialMagnetarMcpSession(this.magnetarSdk, init);
    return await session.getClient();
  }

  async withSession<T>(
    init: MetorialMagnetarMcpSessionInit | MetorialMagnetarMcpSessionTemplateInit,
    action: (session: MetorialMagnetarMcpSession) => Promise<T>
  ): Promise<T> {
    let session = new MetorialMagnetarMcpSession(this.magnetarSdk, init);
    try {
      return await action(session);
    } finally {
      await session.close();
    }
  }

  async withProviderSession<P, T>(
    provider: (session: MetorialMagnetarMcpSession) => Promise<P>,
    init: (MetorialMagnetarMcpSessionInit | MetorialMagnetarMcpSessionTemplateInit) & { streaming?: boolean },
    action: (
      input: P & {
        session: MetorialMagnetarMcpSession;
        getSession: MetorialMagnetarMcpSession['getSession'];
        getCapabilities: MetorialMagnetarMcpSession['getCapabilities'];
        getToolManager: MetorialMagnetarMcpSession['getToolManager'];
        closeSession: () => Promise<void>;
      }
    ) => Promise<T>
  ): Promise<T> {
    if (init.streaming) {
      return this.withMagnetarStreamingSession(provider, init, action);
    }

    return this.withSession(init, async session => {
      let providerData = await provider(session);

      return action({
        ...providerData,
        session,
        getSession: session.getSession.bind(session),
        getCapabilities: session.getCapabilities.bind(session),
        getToolManager: session.getToolManager.bind(session),
        closeSession: async () => {}
      });
    });
  }

  private async withMagnetarStreamingSession<P, T>(
    provider: (session: MetorialMagnetarMcpSession) => Promise<P>,
    init: MetorialMagnetarMcpSessionInit | MetorialMagnetarMcpSessionTemplateInit,
    action: (
      input: P & {
        session: MetorialMagnetarMcpSession;
        getSession: MetorialMagnetarMcpSession['getSession'];
        getCapabilities: MetorialMagnetarMcpSession['getCapabilities'];
        getToolManager: MetorialMagnetarMcpSession['getToolManager'];
        closeSession: () => Promise<void>;
      }
    ) => Promise<T>
  ): Promise<T> {
    let session = new MetorialMagnetarMcpSession(this.magnetarSdk, init);
    let sessionClosed = false;

    const closeSession = async () => {
      if (!sessionClosed) {
        sessionClosed = true;
        await session.close();
      }
    };

    try {
      let providerData = await provider(session);

      let result = await action({
        ...providerData,
        session,
        getSession: session.getSession.bind(session),
        getCapabilities: session.getCapabilities.bind(session),
        getToolManager: session.getToolManager.bind(session),
        closeSession
      });

      let timeout = setTimeout(async () => {
        if (!sessionClosed) {
          await closeSession();
        }
      }, 60000);
      timeout.unref();

      return result;
    } catch (error) {
      await closeSession();
      throw error;
    }
  }

  // ── Pulsar MCP helpers (used by v1) ──────────────────────────────

  async _pulsarCreateMcpConnection(init: MetorialMcpSessionInitServerDeployments[number]) {
    let session = new MetorialMcpSession(this.pulsarSdk, {
      serverDeployments: [init]
    });

    let deployments = await session.getServerDeployments();

    return await session.getClient({
      deploymentId: deployments[0].id
    });
  }

  async _pulsarWithSession<T>(
    init: MetorialMcpSessionInit,
    action: (session: MetorialMcpSession) => Promise<T>
  ): Promise<T> {
    let session = new MetorialMcpSession(this.pulsarSdk, init);
    try {
      return await action(session);
    } finally {
      await session.close();
    }
  }

  async _pulsarWithProviderSession<P, T>(
    provider: (session: MetorialMcpSession) => Promise<P>,
    init: MetorialMcpSessionInit & { streaming?: boolean },
    action: (
      input: P & {
        session: MetorialMcpSession;
        getSession: MetorialMcpSession['getSession'];
        getCapabilities: MetorialMcpSession['getCapabilities'];
        getClient: MetorialMcpSession['getClient'];
        getServerDeployments: MetorialMcpSession['getServerDeployments'];
        getToolManager: MetorialMcpSession['getToolManager'];
      }
    ) => Promise<T>
  ): Promise<T> {
    if (init.streaming) {
      return this.withStreamingSession(provider, init, action);
    }

    return this._pulsarWithSession(init, async session => {
      let providerData = await provider(session);

      return action({
        ...providerData,
        session,
        getSession: session.getSession.bind(session),
        getCapabilities: session.getCapabilities.bind(session),
        getClient: session.getClient.bind(session),
        getServerDeployments: session.getServerDeployments.bind(session),
        getToolManager: session.getToolManager.bind(session)
      });
    });
  }

  private async withStreamingSession<P, T>(
    provider: (session: MetorialMcpSession) => Promise<P>,
    init: MetorialMcpSessionInit,
    action: (
      input: P & {
        session: MetorialMcpSession;
        getSession: MetorialMcpSession['getSession'];
        getCapabilities: MetorialMcpSession['getCapabilities'];
        getClient: MetorialMcpSession['getClient'];
        getServerDeployments: MetorialMcpSession['getServerDeployments'];
        getToolManager: MetorialMcpSession['getToolManager'];
        closeSession: () => Promise<void>;
      }
    ) => Promise<T>
  ): Promise<T> {
    let session = new MetorialMcpSession(this.pulsarSdk, init);
    let sessionClosed = false;

    const closeSession = async () => {
      if (!sessionClosed) {
        sessionClosed = true;
        await session.close();
      }
    };

    try {
      let providerData = await provider(session);

      let result = await action({
        ...providerData,
        session,
        getSession: session.getSession.bind(session),
        getCapabilities: session.getCapabilities.bind(session),
        getClient: session.getClient.bind(session),
        getServerDeployments: session.getServerDeployments.bind(session),
        getToolManager: session.getToolManager.bind(session),
        closeSession
      });

      let timeout = setTimeout(async () => {
        if (!sessionClosed) {
          await closeSession();
        }
      }, 60000);
      timeout.unref();

      return result;
    } catch (error) {
      await closeSession();
      throw error;
    }
  }

  async waitForSetupSession(
    sessions: { id: string } | Array<{ id: string }>,
    options?: {
      pollInterval?: number;
      timeout?: number;
    }
  ) {
    let sessionList = Array.isArray(sessions) ? sessions : [sessions];
    let pollInterval = Math.max(options?.pollInterval ?? 5000, 2000);
    let timeout = options?.timeout ?? 600000;
    let startTime = Date.now();

    if (sessionList.length === 0) {
      return [];
    }

    while (true) {
      if (Date.now() - startTime > timeout) {
        throw new Error(`Setup session timed out after ${timeout / 1000} seconds`);
      }

      try {
        let statuses = await Promise.all(
          sessionList.map(s => this.magnetarSdk.providerDeployments.setupSessions.get(s.id))
        );

        let failed = statuses.filter(s => s.status === 'failed');
        if (failed.length > 0) {
          throw new Error(`${failed.length} setup session(s) failed`);
        }

        let allCompleted = statuses.every(s => s.status === 'completed');
        if (allCompleted) {
          return statuses;
        }

        await new Promise(resolve => setTimeout(resolve, pollInterval));
      } catch (error) {
        if (
          error instanceof Error &&
          (error.message.includes('setup session') &&
            (error.message.includes('failed') || error.message.includes('timed out')))
        ) {
          throw error;
        }

        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
    }
  }

  async waitForOAuthCompletion(
    sessions: Array<{ id: string }>,
    options?: {
      pollInterval?: number;
      timeout?: number;
    }
  ): Promise<void> {
    let pollInterval = Math.max(options?.pollInterval ?? 5000, 2000); // minimum 2 seconds
    let timeout = options?.timeout ?? 600000; // 10 minutes
    let startTime = Date.now();

    if (sessions.length === 0) {
      return;
    }

    while (true) {
      if (Date.now() - startTime > timeout) {
        throw new Error(`OAuth authentication timeout after ${timeout / 1000} seconds`);
      }

      try {
        let statuses = await Promise.all(
          sessions.map(session => this.oauth.sessions.get(session.id))
        );

        let allCompleted = statuses.every(status => status.status === 'completed');
        if (allCompleted) {
          return;
        }

        let failedSessions = statuses.filter(status => status.status === 'failed');
        if (failedSessions.length > 0) {
          throw new Error(
            `OAuth authentication failed for ${failedSessions.length} session(s)`
          );
        }

        await new Promise(resolve => setTimeout(resolve, pollInterval));
      } catch (error) {
        if (
          error instanceof Error &&
          (error.message.includes('OAuth authentication failed') ||
            error.message.includes('OAuth authentication timeout'))
        ) {
          throw error;
        }

        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
    }
  }

}
