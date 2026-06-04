import {
  mapDashboardInstanceFilesGetOutput,
  MetorialCallbacksDestinationsEndpoint,
  MetorialCallbacksEndpoint,
  MetorialCallbacksEventsEndpoint,
  MetorialCallbacksInstancesEndpoint,
  MetorialCustomProvidersDeploymentsEndpoint,
  MetorialCustomProvidersEndpoint,
  MetorialCustomProvidersVersionsEndpoint,
  MetorialDocumentsEndpoint,
  MetorialDocumentsParticipantsEndpoint,
  MetorialDocumentsVersionsEndpoint,
  MetorialFilesEndpoint,
  MetorialFilesLinksEndpoint,
  MetorialInstanceEndpoint,
  MetorialIntegrationsEndpoint,
  MetorialIntegrationsInstanceGroupsEndpoint,
  MetorialIntegrationsInstanceGroupsProvidersEndpoint,
  MetorialIntegrationsInstancesEndpoint,
  MetorialIntegrationsInstancesProvidersEndpoint,
  MetorialIntegrationsProvidersEndpoint,
  MetorialIntegrationsSetupSessionsEndpoint,
  MetorialMagicMcpEndpointsEndpoint,
  MetorialMagicMcpGroupsEndpoint,
  MetorialMagicMcpServersEndpoint,
  MetorialMagicMcpServersProvidersEndpoint,
  MetorialMagicMcpSessionsEndpoint,
  MetorialMagicMcpTokensEndpoint,
  MetorialPortalsAccessEndpoint,
  MetorialPortalsAccessRequestsEndpoint,
  MetorialPortalsAuthAppEndpoint,
  MetorialPortalsAuthSsoTenantsConnectionsEndpoint,
  MetorialPortalsAuthSsoTenantsEndpoint,
  MetorialPortalsConsumerGroupsEndpoint,
  MetorialPortalsConsumerInvitesEndpoint,
  MetorialPortalsConsumerProfilesEndpoint,
  MetorialPortalsEndpoint,
  MetorialPortalsListingsEndpoint,
  MetorialProviderDeploymentsAuthConfigsEndpoint,
  MetorialProviderDeploymentsAuthConfigsExportsEndpoint,
  MetorialProviderDeploymentsAuthConfigsImportsEndpoint,
  MetorialProviderDeploymentsAuthCredentialsEndpoint,
  MetorialProviderDeploymentsConfigsEndpoint,
  MetorialProviderDeploymentsConfigVaultsEndpoint,
  MetorialProviderDeploymentsEndpoint,
  MetorialProviderDeploymentsSetupSessionsEndpoint,
  MetorialProviderRunsEndpoint,
  MetorialProvidersAuthMethodsEndpoint,
  MetorialProvidersEndpoint,
  MetorialProvidersSpecificationsEndpoint,
  MetorialProviderToolsEndpoint,
  MetorialProvidersTriggersEndpoint,
  MetorialProvidersVersionsEndpoint,
  MetorialPublishersEndpoint,
  MetorialSessionsConnectionsEndpoint,
  MetorialSessionsEndpoint,
  MetorialSessionsErrorsEndpoint,
  MetorialSessionsMessagesEndpoint,
  MetorialSessionsParticipantsEndpoint,
  MetorialSessionsProvidersEndpoint,
  MetorialSessionTemplatesEndpoint,
  MetorialSessionTemplatesProvidersEndpoint,
  MetorialSkillsAgentsEndpoint,
  MetorialSkillsConfigurationsEndpoint,
  MetorialSkillsEndpoint,
  MetorialSkillsExportsEndpoint,
  MetorialSkillsGroupsEndpoint,
  MetorialSkillsGroupsItemsEndpoint,
  MetorialSkillsItemsEndpoint,
  MetorialSkillsMarketplacesEndpoint,
  MetorialSkillsMarketplacesPluginsEndpoint,
  MetorialSkillsParticipantsEndpoint,
  MetorialSkillsPluginsEndpoint,
  MetorialSkillsPluginsSkillsEndpoint,
  MetorialSkillsTemplatesEndpoint,
  MetorialSkillsTemplatesItemsEndpoint,
  MetorialSkillsVersionsEndpoint,
  MetorialSkillsVersionsSnapshotEndpoint,
  MetorialStoresEndpoint,
  MetorialStoresItemsEndpoint,
  MetorialStoresParticipantsEndpoint,
  MetorialToolCallsEndpoint
} from '@metorial/generated';
import { coreSdkBuilder, MetorialKeyPrefix } from './builder';

export let createMetorialCoreSDK = coreSdkBuilder.build(
  (soft: {
    apiKey: `${MetorialKeyPrefix}${string}` | string;
    apiVersion?: '2026-01-01-magnetar';
    headers?: Record<string, string>;
    apiHost?: string;
    fetch?: any;
  }) => ({
    ...soft,
    apiHost: soft.apiHost,
    apiVersion: '2026-01-01-magnetar',
    fetch: soft.fetch
  })
)(manager => ({
  instance: new MetorialInstanceEndpoint(manager),

  publishers: new MetorialPublishersEndpoint(manager),

  provider: {
    tools: new MetorialProviderToolsEndpoint(manager)
  },

  providers: Object.assign(new MetorialProvidersEndpoint(manager), {
    versions: new MetorialProvidersVersionsEndpoint(manager),
    specifications: new MetorialProvidersSpecificationsEndpoint(manager),
    triggers: new MetorialProvidersTriggersEndpoint(manager),
    authMethods: new MetorialProvidersAuthMethodsEndpoint(manager)
  }),

  integrations: Object.assign(new MetorialIntegrationsEndpoint(manager), {
    providers: new MetorialIntegrationsProvidersEndpoint(manager),
    instances: Object.assign(new MetorialIntegrationsInstancesEndpoint(manager), {
      providers: new MetorialIntegrationsInstancesProvidersEndpoint(manager)
    }),
    instanceGroups: Object.assign(new MetorialIntegrationsInstanceGroupsEndpoint(manager), {
      providers: new MetorialIntegrationsInstanceGroupsProvidersEndpoint(manager)
    }),
    setupSessions: new MetorialIntegrationsSetupSessionsEndpoint(manager)
  }),

  documents: Object.assign(new MetorialDocumentsEndpoint(manager), {
    versions: new MetorialDocumentsVersionsEndpoint(manager),
    participants: new MetorialDocumentsParticipantsEndpoint(manager)
  }),

  stores: Object.assign(new MetorialStoresEndpoint(manager), {
    items: new MetorialStoresItemsEndpoint(manager),
    participants: new MetorialStoresParticipantsEndpoint(manager)
  }),

  files: Object.assign(new MetorialFilesEndpoint(manager), {
    links: new MetorialFilesLinksEndpoint(manager),
    upload: async (input: {
      file: File | Blob;
      purpose: string;
      title?: string;
      store?: {
        id: string;
        path: string;
      };
    }) => {
      let body = new FormData();
      body.append('file', input.file);
      body.append('purpose', input.purpose);
      if (input.title) body.append('title', input.title);
      if (input.store) {
        body.append('store_id', input.store.id);
        body.append('path', input.store.path);
      }

      return await manager
        ._post({
          path: ['files'],
          body
        })
        .transform(mapDashboardInstanceFilesGetOutput);
    }
  }),

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

  sessions: Object.assign(new MetorialSessionsEndpoint(manager), {
    providers: new MetorialSessionsProvidersEndpoint(manager),
    participants: new MetorialSessionsParticipantsEndpoint(manager),
    errors: new MetorialSessionsErrorsEndpoint(manager),
    messages: new MetorialSessionsMessagesEndpoint(manager),
    connections: new MetorialSessionsConnectionsEndpoint(manager)
  }),

  skills: Object.assign(new MetorialSkillsEndpoint(manager), {
    configurations: new MetorialSkillsConfigurationsEndpoint(manager),
    agents: new MetorialSkillsAgentsEndpoint(manager),
    items: new MetorialSkillsItemsEndpoint(manager),
    participants: new MetorialSkillsParticipantsEndpoint(manager),
    exports: new MetorialSkillsExportsEndpoint(manager),

    templates: Object.assign(new MetorialSkillsTemplatesEndpoint(manager), {
      items: new MetorialSkillsTemplatesItemsEndpoint(manager)
    }),

    marketplaces: Object.assign(new MetorialSkillsMarketplacesEndpoint(manager), {
      plugins: new MetorialSkillsMarketplacesPluginsEndpoint(manager)
    }),

    plugins: Object.assign(new MetorialSkillsPluginsEndpoint(manager), {
      skills: new MetorialSkillsPluginsSkillsEndpoint(manager)
    }),

    versions: Object.assign(new MetorialSkillsVersionsEndpoint(manager), {
      snapshot: new MetorialSkillsVersionsSnapshotEndpoint(manager)
    }),

    groups: Object.assign(new MetorialSkillsGroupsEndpoint(manager), {
      items: new MetorialSkillsGroupsItemsEndpoint(manager)
    })
  }),

  callbacks: Object.assign(new MetorialCallbacksEndpoint(manager), {
    destinations: new MetorialCallbacksDestinationsEndpoint(manager),
    events: new MetorialCallbacksEventsEndpoint(manager),
    instances: new MetorialCallbacksInstancesEndpoint(manager)
  }),

  sessionTemplates: Object.assign(new MetorialSessionTemplatesEndpoint(manager), {
    providers: new MetorialSessionTemplatesProvidersEndpoint(manager)
  }),

  providerRuns: new MetorialProviderRunsEndpoint(manager),

  toolCalls: new MetorialToolCallsEndpoint(manager),

  customProviders: Object.assign(new MetorialCustomProvidersEndpoint(manager), {
    versions: new MetorialCustomProvidersVersionsEndpoint(manager),
    deployments: new MetorialCustomProvidersDeploymentsEndpoint(manager)
  }),

  magicMcp: {
    servers: Object.assign(new MetorialMagicMcpServersEndpoint(manager), {
      providers: new MetorialMagicMcpServersProvidersEndpoint(manager)
    }),
    groups: new MetorialMagicMcpGroupsEndpoint(manager),
    sessions: new MetorialMagicMcpSessionsEndpoint(manager),
    tokens: new MetorialMagicMcpTokensEndpoint(manager),
    endpoints: new MetorialMagicMcpEndpointsEndpoint(manager)
  },

  portals: Object.assign(new MetorialPortalsEndpoint(manager), {
    auth: Object.assign(new MetorialPortalsAuthAppEndpoint(manager), {
      ssoTenants: Object.assign(new MetorialPortalsAuthSsoTenantsEndpoint(manager), {
        connections: new MetorialPortalsAuthSsoTenantsConnectionsEndpoint(manager)
      })
    }),
    access: new MetorialPortalsAccessEndpoint(manager),
    accessRequests: new MetorialPortalsAccessRequestsEndpoint(manager),

    listings: new MetorialPortalsListingsEndpoint(manager),

    consumerGroups: new MetorialPortalsConsumerGroupsEndpoint(manager),
    consumerInvites: new MetorialPortalsConsumerInvitesEndpoint(manager),
    consumerProfiles: new MetorialPortalsConsumerProfilesEndpoint(manager)
  })
}));

export type MetorialCoreSDK = ReturnType<typeof createMetorialCoreSDK>;
