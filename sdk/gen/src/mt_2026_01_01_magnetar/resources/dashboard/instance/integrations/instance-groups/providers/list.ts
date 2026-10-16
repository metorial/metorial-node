import { createMapper } from '@metorial/util-resource-mapper/compact';

export type DashboardInstanceIntegrationsInstanceGroupsProvidersListOutput = {
  items: {
    object: 'integration.instance.group.provider';
    id: string;
    status: 'active' | 'archived' | 'deleted';
    name: string;
    description: string | null;
    metadata: Record<string, any> | null;
    integrationId: string;
    integrationInstanceGroupId: string;
    integrationInstanceId: string;
    integrationProviderId: string | null;
    integrationInstanceProviderId: string;
    toolFilter:
      | { type: 'allow_all'; ignoreParentFilters: boolean }
      | {
          type: 'filter';
          filters: (
            | { type: 'tool_keys'; keys: string[] }
            | { type: 'tool_categories'; keys: string[] }
            | { type: 'tool_regex'; pattern: string }
            | { type: 'resource_regex'; pattern: string }
            | { type: 'resource_uris'; uris: string[] }
            | { type: 'prompt_keys'; keys: string[] }
            | { type: 'prompt_regex'; pattern: string }
          )[];
          ignoreParentFilters: boolean;
        }
      | null;
    isOverrideToolFilter: boolean;
    createdAt: Date;
    updatedAt: Date;
    archivedAt: Date | null;
  }[];
  pagination: { hasMoreBefore: boolean; hasMoreAfter: boolean };
};

export let mapDashboardInstanceIntegrationsInstanceGroupsProvidersListOutput =
  /* @__PURE__ */ createMapper<DashboardInstanceIntegrationsInstanceGroupsProvidersListOutput>(
    [
      7,
      [
        1,
        [
          'integration_id',
          'integration_instance_group_id',
          'integration_instance_id',
          'integration_provider_id',
          'integration_instance_provider_id',
          ['tool_filter', 1, [3, [[0, [1, ['ignore_parent_filters']]]]]],
          'is_override_tool_filter',
          'created_at',
          'updated_at',
          'archived_at'
        ]
      ]
    ],
    1
  );

export type DashboardInstanceIntegrationsInstanceGroupsProvidersListQuery = {
  limit?: number | undefined;
  after?: string | undefined;
  before?: string | undefined;
  cursor?: string | undefined;
  order?: 'asc' | 'desc' | undefined;
} & {
  status?:
    | 'active'
    | 'archived'
    | 'deleted'
    | ('active' | 'archived' | 'deleted')[]
    | undefined;
  id?: string | string[] | undefined;
  integrationInstanceGroupId?: string | string[] | undefined;
  integrationId?: string | string[] | undefined;
  integrationInstanceId?: string | string[] | undefined;
  integrationInstanceProviderId?: string | string[] | undefined;
  providerId?: string | string[] | undefined;
  integrationProviderId?: string | string[] | undefined;
  providerDeploymentId?: string | string[] | undefined;
  providerConfigId?: string | string[] | undefined;
  providerAuthConfigId?: string | string[] | undefined;
  sessionTemplateId?: string | string[] | undefined;
  createdAt?: { gt?: Date | undefined; lt?: Date | undefined } | undefined;
  updatedAt?: { gt?: Date | undefined; lt?: Date | undefined } | undefined;
};

export let mapDashboardInstanceIntegrationsInstanceGroupsProvidersListQuery =
  /* @__PURE__ */ createMapper<DashboardInstanceIntegrationsInstanceGroupsProvidersListQuery>(
    [
      3,
      [
        [
          0,
          [
            1,
            [
              'integration_instance_group_id',
              'integration_id',
              'integration_instance_id',
              'integration_instance_provider_id',
              'provider_id',
              'integration_provider_id',
              'provider_deployment_id',
              'provider_config_id',
              'provider_auth_config_id',
              'session_template_id',
              ['created_at', 1, 5],
              ['updated_at', 1, 5]
            ]
          ]
        ]
      ]
    ]
  );
