import {
  MetorialInstanceEndpoint as MagnetarInstanceEndpoint,
  MetorialProvidersEndpoint,
  MetorialProvidersVersionsEndpoint,
  MetorialProvidersToolsEndpoint,
  MetorialProvidersAuthMethodsEndpoint,
  MetorialProvidersSpecificationsEndpoint,
  MetorialProviderDeploymentsEndpoint,
  MetorialProviderDeploymentsConfigsEndpoint,
  MetorialProviderDeploymentsConfigVaultsEndpoint,
  MetorialProviderDeploymentsAuthConfigsEndpoint,
  MetorialProviderDeploymentsAuthCredentialsEndpoint,
  MetorialProviderDeploymentsSetupSessionsEndpoint,
  MetorialSessionsEndpoint as MagnetarSessionsEndpoint,
  MetorialSessionsMessagesEndpoint as MagnetarSessionsMessagesEndpoint,
  MetorialSessionsConnectionsEndpoint as MagnetarSessionsConnectionsEndpoint,
  MetorialSessionsEventsEndpoint,
  MetorialSessionsProvidersEndpoint,
  MetorialSessionsParticipantsEndpoint,
  MetorialSessionsErrorsEndpoint,
  MetorialSessionsErrorGroupsEndpoint,
  MetorialSessionTemplatesEndpoint,
  MetorialSessionTemplatesProvidersEndpoint,
  MetorialProviderRunsEndpoint
} from '@metorial/generated/src/mt_2026_01_01_magnetar';
import { MetorialKeyPrefix, magnetarSdkBuilder } from './magnetarBuilder';

export let createMetorialMagnetarCoreSDK = magnetarSdkBuilder.build(
  (soft: {
    apiKey: `${MetorialKeyPrefix}${string}` | string;
    apiVersion?: '2026-01-01-magnetar';
    headers?: Record<string, string>;
    apiHost?: string;
    mcpHost?: string;
    fetch?: any;
  }) => ({
    ...soft,
    apiHost: soft.apiHost,
    mcpHost: soft.mcpHost ?? soft.apiHost,
    apiVersion: '2026-01-01-magnetar',
    fetch: soft.fetch
  })
)(manager => ({
  instance: new MagnetarInstanceEndpoint(manager),

  providers: Object.assign(new MetorialProvidersEndpoint(manager), {
    versions: new MetorialProvidersVersionsEndpoint(manager),
    tools: new MetorialProvidersToolsEndpoint(manager),
    authMethods: new MetorialProvidersAuthMethodsEndpoint(manager),
    specifications: new MetorialProvidersSpecificationsEndpoint(manager)
  }),

  providerDeployments: Object.assign(new MetorialProviderDeploymentsEndpoint(manager), {
    configs: new MetorialProviderDeploymentsConfigsEndpoint(manager),
    configVaults: new MetorialProviderDeploymentsConfigVaultsEndpoint(manager),
    authConfigs: new MetorialProviderDeploymentsAuthConfigsEndpoint(manager),
    authCredentials: new MetorialProviderDeploymentsAuthCredentialsEndpoint(manager),
    setupSessions: new MetorialProviderDeploymentsSetupSessionsEndpoint(manager)
  }),

  sessions: Object.assign(new MagnetarSessionsEndpoint(manager), {
    messages: new MagnetarSessionsMessagesEndpoint(manager),
    connections: new MagnetarSessionsConnectionsEndpoint(manager),
    events: new MetorialSessionsEventsEndpoint(manager),
    providers: new MetorialSessionsProvidersEndpoint(manager),
    participants: new MetorialSessionsParticipantsEndpoint(manager),
    errors: new MetorialSessionsErrorsEndpoint(manager),
    errorGroups: new MetorialSessionsErrorGroupsEndpoint(manager)
  }),

  sessionTemplates: Object.assign(new MetorialSessionTemplatesEndpoint(manager), {
    providers: new MetorialSessionTemplatesProvidersEndpoint(manager)
  }),

  providerRuns: new MetorialProviderRunsEndpoint(manager)
}));

export type MetorialMagnetarCoreSDK = ReturnType<typeof createMetorialMagnetarCoreSDK>;
