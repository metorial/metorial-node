import { MetorialCoreSDK, createMetorialCoreSDK } from '@metorial/core';
import {
  MetorialMcpSession,
  MetorialMcpSessionInit,
  MetorialMcpSessionInitProviders,
  MetorialMcpToolManager
} from '@metorial/mcp-session';

export type {
  MetorialMcpSession,
  MetorialMcpSessionInit,
  MetorialMcpSessionInitProviders
} from '@metorial/mcp-session';

type MetorialSession = { getToolManager(): Promise<MetorialMcpToolManager> };

export interface MetorialAdapter<T> {
  __resolve(session: MetorialSession): Promise<T>;
}

export class Metorial {
  private readonly sdk: MetorialCoreSDK;

  constructor(init: Omit<Parameters<typeof createMetorialCoreSDK>[0], 'apiVersion'>) {
    this.sdk = createMetorialCoreSDK(init);
  }

  get providers() {
    return this.sdk.providers;
  }

  get providerDeployments() {
    let deployments = this.sdk.providerDeployments;
    Object.assign(deployments.setupSessions, {
      waitForCompletion: this.waitForSetupSession.bind(this)
    });
    return deployments;
  }

  get sessions() {
    return this.sdk.sessions;
  }

  get sessionTemplates() {
    return this.sdk.sessionTemplates;
  }

  get providerRuns() {
    return this.sdk.providerRuns;
  }

  get instance() {
    return this.sdk.instance;
  }

  get publishers() {
    return this.sdk.publishers;
  }

  get providerCategories() {
    return this.sdk.providerCategories;
  }

  get providerCollections() {
    return this.sdk.providerCollections;
  }

  get providerGroups() {
    return this.sdk.providerGroups;
  }

  get providerListings() {
    return this.sdk.providerListings;
  }

  get providerSetupSessions() {
    return this.sdk.providerSetupSessions;
  }

  get toolCalls() {
    return this.sdk.toolCalls;
  }

  get customProviders() {
    return this.sdk.customProviders;
  }

  async connect<T>(options: {
    adapter: MetorialAdapter<T>;
    providers: MetorialMcpSessionInitProviders;
    client?: { name?: string; version?: string };
  }): Promise<T> {
    let session = await MetorialMcpSession.create(this.sdk, {
      providers: options.providers,
      client: options.client
    });

    return options.adapter.__resolve(session);
  }

  /** @deprecated Use `metorial.connect()` instead. */
  async withProviderSession<P, T>(
    adapter: MetorialAdapter<P> | (() => MetorialAdapter<P>),
    init: MetorialMcpSessionInit & { streaming?: boolean },
    action: (input: P & { closeSession: () => Promise<void> }) => Promise<T>
  ): Promise<T> {
    let session = await MetorialMcpSession.create(this.sdk, init);
    let resolved = typeof adapter === 'function' ? adapter() : adapter;
    let adapterResult = await resolved.__resolve(session) as Record<string, unknown>;

    if (
      adapterResult &&
      typeof adapterResult === 'object' &&
      'tools' in adapterResult &&
      typeof adapterResult.tools === 'function'
    ) {
      adapterResult.tools = (adapterResult.tools as () => unknown)();
    }

    return action({ ...adapterResult as P, closeSession: async () => {} });
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
          sessionList.map(s => this.sdk.providerDeployments.setupSessions.get(s.id))
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
          error.message.includes('setup session') &&
          (error.message.includes('failed') || error.message.includes('timed out'))
        ) {
          throw error;
        }

        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
    }
  }
}

export default Metorial;
