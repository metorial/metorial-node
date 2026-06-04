export { coreSdkBuilder as metorialSdkBuilder } from './builder';
export type { MetorialCoreSDKConfig as MetorialSDKConfig } from './builder';
export { createMetorialCoreSDK } from './sdk';
export type { MetorialCoreSDK } from './sdk';

import type * as MetorialGenerated from '@metorial/generated';

export namespace MetorialSDK {
  export type Instance = MetorialGenerated.InstanceGetOutput;
  export type Publisher = MetorialGenerated.PublishersGetOutput;

  export type Provider = MetorialGenerated.ProvidersGetOutput;
  export type ProviderVersion = MetorialGenerated.ProvidersVersionsGetOutput;
  export type ProviderSpecification = MetorialGenerated.ProvidersSpecificationsGetOutput;
  export type ProviderTrigger = MetorialGenerated.ProvidersTriggersGetOutput;
  export type ProviderTool = MetorialGenerated.ProviderToolsGetOutput;
  export type ProviderAuthMethod = MetorialGenerated.ProvidersAuthMethodsGetOutput;

  export type Integration = MetorialGenerated.IntegrationsGetOutput;
  export type IntegrationProvider = MetorialGenerated.IntegrationsProvidersGetOutput;
  export type IntegrationSetupSession = MetorialGenerated.IntegrationsSetupSessionsGetOutput;
  export type IntegrationInstance = MetorialGenerated.IntegrationsInstancesGetOutput;
  export type IntegrationInstanceProvider =
    MetorialGenerated.IntegrationsInstancesProvidersGetOutput;
  export type IntegrationInstanceGroup = MetorialGenerated.IntegrationsInstanceGroupsGetOutput;
  export type IntegrationInstanceGroupProvider =
    MetorialGenerated.IntegrationsInstanceGroupsProvidersGetOutput;

  export type Document = MetorialGenerated.DocumentsGetOutput;
  export type DocumentVersion = MetorialGenerated.DocumentsVersionsGetOutput;
  export type DocumentParticipant = MetorialGenerated.DocumentsParticipantsGetOutput;

  export type Store = MetorialGenerated.StoresGetOutput;
  export type StoreItem = MetorialGenerated.StoresItemsGetOutput;
  export type StoreParticipant = MetorialGenerated.StoresParticipantsGetOutput;

  export type File = MetorialGenerated.FilesGetOutput;
  export type FileLink = MetorialGenerated.FilesLinksGetOutput;

  export type ProviderCategory = MetorialGenerated.ProviderCategoriesGetOutput;
  export type ProviderCollection = MetorialGenerated.ProviderCollectionsGetOutput;
  export type ProviderGroup = MetorialGenerated.ProviderGroupsGetOutput;
  export type ProviderListing = MetorialGenerated.ProviderListingsGetOutput;

  export type ProviderDeployment = MetorialGenerated.ProviderDeploymentsGetOutput;
  export type ProviderDeploymentConfig = MetorialGenerated.ProviderDeploymentsConfigsGetOutput;
  export type ProviderDeploymentConfigVault =
    MetorialGenerated.ProviderDeploymentsConfigVaultsGetOutput;
  export type ProviderDeploymentAuthCredential =
    MetorialGenerated.ProviderDeploymentsAuthCredentialsGetOutput;
  export type ProviderDeploymentSetupSession =
    MetorialGenerated.ProviderDeploymentsSetupSessionsGetOutput;
  export type ProviderDeploymentAuthConfig =
    MetorialGenerated.ProviderDeploymentsAuthConfigsGetOutput;
  export type ProviderDeploymentAuthConfigImport =
    MetorialGenerated.ProviderDeploymentsAuthConfigsImportsGetOutput;
  export type ProviderDeploymentAuthConfigExport =
    MetorialGenerated.ProviderDeploymentsAuthConfigsExportsGetOutput;
  export type ProviderSetupSession =
    MetorialGenerated.ProviderDeploymentsSetupSessionsGetOutput;

  export type Session = MetorialGenerated.SessionsGetOutput;
  export type SessionProvider = MetorialGenerated.SessionsProvidersGetOutput;
  export type SessionParticipant = MetorialGenerated.SessionsParticipantsGetOutput;
  export type SessionError = MetorialGenerated.SessionsErrorsGetOutput;
  export type SessionMessage = MetorialGenerated.SessionsMessagesGetOutput;
  export type SessionConnection = MetorialGenerated.SessionsConnectionsGetOutput;

  export type Skill = MetorialGenerated.SkillsGetOutput;
  export type SkillConfiguration = MetorialGenerated.SkillsConfigurationsGetOutput;
  export type SkillAgent = MetorialGenerated.SkillsAgentsGetOutput;
  export type SkillItem = MetorialGenerated.SkillsItemsGetOutput;
  export type SkillParticipant = MetorialGenerated.SkillsParticipantsGetOutput;
  export type SkillExport = MetorialGenerated.SkillsExportsGetOutput;
  export type SkillTemplate = MetorialGenerated.SkillsTemplatesGetOutput;
  export type SkillTemplateItem = MetorialGenerated.SkillsTemplatesItemsGetOutput;
  export type SkillMarketplace = MetorialGenerated.SkillsMarketplacesGetOutput;
  export type SkillMarketplacePlugin = MetorialGenerated.SkillsMarketplacesPluginsGetOutput;
  export type SkillPlugin = MetorialGenerated.SkillsPluginsGetOutput;
  export type SkillPluginSkill = MetorialGenerated.SkillsPluginsSkillsGetOutput;
  export type SkillVersion = MetorialGenerated.SkillsVersionsGetOutput;
  export type SkillVersionSnapshot = MetorialGenerated.SkillsVersionsSnapshotGetOutput;
  export type SkillGroup = MetorialGenerated.SkillsGroupsGetOutput;
  export type SkillGroupItem = MetorialGenerated.SkillsGroupsItemsGetOutput;

  export type Callback = MetorialGenerated.CallbacksGetOutput;
  export type CallbackDestination = MetorialGenerated.CallbacksDestinationsGetOutput;
  export type CallbackEvent = MetorialGenerated.CallbacksEventsGetOutput;
  export type CallbackInstance = MetorialGenerated.CallbacksInstancesGetOutput;

  export type SessionTemplate = MetorialGenerated.SessionTemplatesGetOutput;
  export type SessionTemplateProvider = MetorialGenerated.SessionTemplatesProvidersGetOutput;

  export type ProviderRun = MetorialGenerated.ProviderRunsGetOutput;
  export type ToolCall = MetorialGenerated.ToolCallsGetOutput;

  export type CustomProvider = MetorialGenerated.CustomProvidersGetOutput;
  export type CustomProviderVersion = MetorialGenerated.CustomProvidersVersionsGetOutput;
  export type CustomProviderDeployment = MetorialGenerated.CustomProvidersDeploymentsGetOutput;

  export type MagicMcpServer = MetorialGenerated.MagicMcpServersGetOutput;
  export type MagicMcpServerProvider = MetorialGenerated.MagicMcpServersProvidersGetOutput;
  export type MagicMcpGroup = MetorialGenerated.MagicMcpGroupsGetOutput;
  export type MagicMcpSession = MetorialGenerated.MagicMcpSessionsGetOutput;
  export type MagicMcpToken = MetorialGenerated.MagicMcpTokensGetOutput;
  export type MagicMcpEndpoint = MetorialGenerated.MagicMcpEndpointsGetOutput;

  export type Portal = MetorialGenerated.PortalsGetOutput;
  export type PortalAccess = MetorialGenerated.PortalsAccessGetOutput;
  export type PortalAccessRequest = MetorialGenerated.PortalsAccessRequestsGetOutput;
  export type PortalAccessGroup = MetorialGenerated.PortalsConsumerGroupsGetOutput;
  export type PortalAccessProfile = MetorialGenerated.PortalsConsumerProfilesGetOutput;
  export type PortalAccessInvite = MetorialGenerated.PortalsConsumerInvitesGetOutput;
}
