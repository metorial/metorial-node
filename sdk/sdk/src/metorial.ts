import { MetorialCoreSDK, createMetorialCoreSDK } from '@metorial/core';
import {
  MetorialMcpSession,
  MetorialMcpSessionInit,
  MetorialMcpSessionInitServerDeployments
} from '@metorial/mcp-session';

import type OpenAI from 'openai';
import type Anthropic from '@anthropic-ai/sdk';
import type { GoogleGenAI } from '@google/genai';
import type { Mistral } from '@mistralai/mistralai';

import { runWithOpenAI } from './providers/openai';
import { runWithAnthropic } from './providers/anthropic';
import { runWithDeepSeek } from './providers/deepseek';
import { runWithGoogle } from './providers/google';
import { runWithMistral } from './providers/mistral';
import { runWithXAI } from './providers/xai';
import { runWithTogetherAI } from './providers/togetherai';

import { RunResult } from './providers/types';

export type { RunResult } from './providers/types';
export type {
  MetorialMcpSession,
  MetorialMcpSessionInit,
  MetorialMcpSessionInitServerDeployments
} from '@metorial/mcp-session';

export class Metorial implements MetorialCoreSDK {
  private readonly sdk: MetorialCoreSDK;

  constructor(init: Parameters<typeof createMetorialCoreSDK>[0]) {
    this.sdk = createMetorialCoreSDK(init);
  }

  get instance() {
    return this.sdk.instance;
  }

  get secrets() {
    return this.sdk.secrets;
  }

  get servers() {
    return this.sdk.servers;
  }

  get sessions() {
    return this.sdk.sessions;
  }

  get oauth(): typeof this.sdk.oauth & {
    waitForCompletion: (
      sessions: Array<{ id: string }>,
      options?: {
        pollInterval?: number;
        timeout?: number;
      }
    ) => Promise<void>;
  } {
    return {
      ...this.sdk.oauth,
      waitForCompletion: this.waitForOAuthCompletion.bind(this)
    };
  }

  get _config() {
    return this.sdk._config;
  }

  get mcp() {
    return {
      createSession: (init: MetorialMcpSessionInit) => new MetorialMcpSession(this.sdk, init),
      withSession: this.withSession.bind(this),
      withProviderSession: this.withProviderSession.bind(this),
      createConnection: this.createMcpConnection.bind(this)
    };
  }

  async createMcpConnection(init: MetorialMcpSessionInitServerDeployments[number]) {
    let session = new MetorialMcpSession(this.sdk, {
      serverDeployments: [init]
    });

    let deployments = await session.getServerDeployments();

    return await session.getClient({
      deploymentId: deployments[0].id
    });
  }

  async withSession<T>(
    init: MetorialMcpSessionInit,
    action: (session: MetorialMcpSession) => Promise<T>
  ): Promise<T> {
    let session = new MetorialMcpSession(this.sdk, init);
    try {
      return await action(session);
    } finally {
      await session.close();
    }
  }

  async withProviderSession<P, T>(
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

    return this.withSession(init, async session => {
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
    let session = new MetorialMcpSession(this.sdk, init);
    let sessionClosed = false;

    const closeSession = async () => {
      if (!sessionClosed) {
        sessionClosed = true;
        console.log('[Metorial] Closing streaming session');
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

      setTimeout(async () => {
        if (!sessionClosed) {
          console.log('[Metorial] Streaming timeout reached - auto-closing session');
          await closeSession();
        }
      }, 60000); // 1 minute timeout

      return result;
    } catch (error) {
      await closeSession();
      throw error;
    }
  }

  private inferProvider(
    model: string
  ): 'openai' | 'anthropic' | 'deepseek' | 'google' | 'mistral' | 'xai' | 'togetherai' {
    let modelLower = model.toLowerCase();

    if (modelLower.startsWith('claude-')) {
      return 'anthropic';
    }

    if (modelLower.startsWith('gpt-') || modelLower.startsWith('o1-')) {
      return 'openai';
    }

    if (modelLower.includes('deepseek')) {
      return 'deepseek';
    }

    if (modelLower.startsWith('gemini-') || modelLower.includes('google')) {
      return 'google';
    }

    if (modelLower.startsWith('mistral-') || modelLower.includes('mistral')) {
      return 'mistral';
    }

    if (modelLower.startsWith('x-') || modelLower === 'grok-beta') {
      return 'xai';
    }

    if (
      modelLower.includes('together') ||
      modelLower.includes('llama') ||
      modelLower.includes('mixtral') ||
      modelLower.includes('qwen') ||
      modelLower.includes('/')
    ) {
      return 'togetherai';
    }

    throw new Error(`Unable to infer provider from model "${model}".`);
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

  async run(config: {
    message: string;
    serverDeployments: string | MetorialMcpSessionInitServerDeployments;
    model: string;
    maxSteps?: number;
    tools?: string[];
    [key: string]: any;
  }): Promise<RunResult> {
    let provider = this.inferProvider(config.model);

    switch (provider) {
      case 'openai':
        return runWithOpenAI({
          ...config,
          client: config.client as OpenAI,
          withProviderSession: this.withProviderSession.bind(this)
        });

      case 'anthropic':
        return runWithAnthropic({
          ...config,
          client: config.client as Anthropic,
          withProviderSession: this.withProviderSession.bind(this)
        });

      case 'deepseek':
        return runWithDeepSeek({
          ...config,
          client: config.client as OpenAI,
          withProviderSession: this.withProviderSession.bind(this)
        });

      case 'google':
        return runWithGoogle({
          ...config,
          client: config.client as GoogleGenAI,
          withProviderSession: this.withProviderSession.bind(this)
        });

      case 'mistral':
        return runWithMistral({
          ...config,
          client: config.client as Mistral,
          withProviderSession: this.withProviderSession.bind(this)
        });

      case 'xai':
        return runWithXAI({
          ...config,
          client: config.client as OpenAI,
          withProviderSession: this.withProviderSession.bind(this)
        });

      case 'togetherai':
        return runWithTogetherAI({
          ...config,
          client: config.client as OpenAI,
          withProviderSession: this.withProviderSession.bind(this)
        });

      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }
}
