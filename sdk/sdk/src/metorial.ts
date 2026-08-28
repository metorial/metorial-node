import { MetorialCoreSDK, createMetorialCoreSDK } from '@metorial/core';
import {
  MetorialMcpSession,
  MetorialMcpSessionInit,
  MetorialMcpSessionInitProviders,
  MetorialMcpToolManager
} from '@metorial/mcp-session';
import { waitForSetupSessions } from './waitForSetupSession';

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

  get providerSetupSessions() {
    return this.sdk.providerSetupSessions;
  }

  get toolCalls() {
    return this.sdk.toolCalls;
  }

  get customProviders() {
    return this.sdk.customProviders;
  }

  get integrations() {
    return this.sdk.integrations;
  }

  get documents() {
    return this.sdk.documents;
  }

  get stores() {
    return this.sdk.stores;
  }

  get files() {
    return this.sdk.files;
  }

  get skills() {
    return this.sdk.skills;
  }

  get callbacks() {
    return this.sdk.callbacks;
  }

  get portals() {
    return this.sdk.portals;
  }

  get magicMcp() {
    return this.sdk.magicMcp;
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
    let adapterResult = (await resolved.__resolve(session)) as Record<string, unknown>;

    if (
      adapterResult &&
      typeof adapterResult === 'object' &&
      'tools' in adapterResult &&
      typeof adapterResult.tools === 'function'
    ) {
      adapterResult.tools = (adapterResult.tools as () => unknown)();
    }

    return action({ ...(adapterResult as P), closeSession: async () => {} });
  }

  async waitForSetupSession(
    sessions: { id: string } | Array<{ id: string }>,
    options?: {
      pollInterval?: number;
      timeout?: number;
    }
  ) {
    return waitForSetupSessions(
      id => this.sdk.providerDeployments.setupSessions.get(id),
      sessions,
      options
    );
  }
}

export default Metorial;
