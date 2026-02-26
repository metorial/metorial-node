import {
  MetorialInstanceEndpoint as MagnetarInstanceEndpoint,
  MetorialPublishersEndpoint,
  MetorialProvidersEndpoint,
  MetorialProvidersVersionsEndpoint,
  MetorialProvidersToolsEndpoint,
  MetorialProvidersAuthMethodsEndpoint,
  MetorialProvidersSpecificationsEndpoint,
  MetorialProviderCategoriesEndpoint,
  MetorialProviderCollectionsEndpoint,
  MetorialProviderGroupsEndpoint,
  MetorialProviderListingsEndpoint,
  MetorialProviderDeploymentsEndpoint,
  MetorialProviderDeploymentsConfigsEndpoint,
  MetorialProviderDeploymentsConfigVaultsEndpoint,
  MetorialProviderDeploymentsAuthConfigsEndpoint,
  MetorialProviderDeploymentsAuthConfigsImportsEndpoint,
  MetorialProviderDeploymentsAuthConfigsExportsEndpoint,
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
  MetorialProviderRunsEndpoint,
  MetorialToolCallsEndpoint,
  MetorialCustomProvidersEndpoint,
  MetorialCustomProvidersVersionsEndpoint,
  MetorialCustomProvidersDeploymentsEndpoint,
  MetorialCustomProvidersEnvironmentsEndpoint,
  MetorialCustomProvidersCommitsEndpoint
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

  publishers: new MetorialPublishersEndpoint(manager),

  providers: Object.assign(new MetorialProvidersEndpoint(manager), {
    versions: new MetorialProvidersVersionsEndpoint(manager),
    tools: new MetorialProvidersToolsEndpoint(manager),
    authMethods: new MetorialProvidersAuthMethodsEndpoint(manager),
    specifications: new MetorialProvidersSpecificationsEndpoint(manager)
  }),

  providerCategories: new MetorialProviderCategoriesEndpoint(manager),
  providerCollections: new MetorialProviderCollectionsEndpoint(manager),
  providerGroups: new MetorialProviderGroupsEndpoint(manager),
  providerListings: new MetorialProviderListingsEndpoint(manager),

  providerDeployments: Object.assign(new MetorialProviderDeploymentsEndpoint(manager), {
    configs: new MetorialProviderDeploymentsConfigsEndpoint(manager),
    configVaults: new MetorialProviderDeploymentsConfigVaultsEndpoint(manager),
    authConfigs: Object.assign(new MetorialProviderDeploymentsAuthConfigsEndpoint(manager), {
      imports: new MetorialProviderDeploymentsAuthConfigsImportsEndpoint(manager),
      exports: new MetorialProviderDeploymentsAuthConfigsExportsEndpoint(manager)
    }),
    authCredentials: new MetorialProviderDeploymentsAuthCredentialsEndpoint(manager),
    setupSessions: new MetorialProviderDeploymentsSetupSessionsEndpoint(manager)
  }),

  providerSetupSessions: new MetorialProviderDeploymentsSetupSessionsEndpoint(manager),

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

  providerRuns: new MetorialProviderRunsEndpoint(manager),

  toolCalls: new MetorialToolCallsEndpoint(manager),

  customProviders: Object.assign(new MetorialCustomProvidersEndpoint(manager), {
    versions: new MetorialCustomProvidersVersionsEndpoint(manager),
    deployments: new MetorialCustomProvidersDeploymentsEndpoint(manager),
    environments: new MetorialCustomProvidersEnvironmentsEndpoint(manager),
    commits: new MetorialCustomProvidersCommitsEndpoint(manager)
  })
}));

export type MetorialMagnetarCoreSDK = ReturnType<typeof createMetorialMagnetarCoreSDK>;
