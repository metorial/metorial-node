import { createMapper } from '@metorial/util-resource-mapper/compact';

export type ManagementInstanceIntegrationsProvidersListOutput = {
  items: {
    object: 'integration.provider';
    id: string;
    status: 'active' | 'archived' | 'deleted';
    integrationId: string;
    name: string;
    description: string | null;
    metadata: Record<string, any> | null;
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
    providerId: string;
    deploymentId: string;
    authMethodId: string | null;
    authCredentialsId: string | null;
    config: {
      object: 'provider.config#preview';
      id: string;
      isDefault: boolean;
      name: string | null;
      description: string | null;
      metadata: Record<string, any> | null;
      providerId: string;
      createdAt: Date;
      updatedAt: Date;
    } | null;
    callbacks: {
      object: 'integration.provider.callbacks';
      status: 'enabled' | 'disabled';
      callbackId: string | null;
    };
    createdAt: Date;
    updatedAt: Date;
    archivedAt: Date | null;
  }[];
  pagination: { hasMoreBefore: boolean; hasMoreAfter: boolean };
};

export let mapManagementInstanceIntegrationsProvidersListOutput =
  /* @__PURE__ */ createMapper<ManagementInstanceIntegrationsProvidersListOutput>(
    [
      7,
      [
        1,
        [
          'integration_id',
          ['tool_filter', 1, [3, [[0, [1, ['ignore_parent_filters']]]]]],
          'provider_id',
          'deployment_id',
          'auth_method_id',
          'auth_credentials_id',
          [
            'config',
            0,
            [1, ['is_default', 'provider_id', 'created_at', 'updated_at']]
          ],
          ['callbacks', 0, [1, ['callback_id']]],
          'created_at',
          'updated_at',
          'archived_at'
        ]
      ]
    ],
    1
  );

export type ManagementInstanceIntegrationsProvidersListQuery = {
  limit?: number | undefined;
  after?: string | undefined;
  before?: string | undefined;
  cursor?: string | undefined;
  order?: 'asc' | 'desc' | undefined;
} & {
  search?: string | undefined;
  status?:
    | 'active'
    | 'archived'
    | 'deleted'
    | ('active' | 'archived' | 'deleted')[]
    | undefined;
  id?: string | string[] | undefined;
  integrationId?: string | string[] | undefined;
  providerId?: string | string[] | undefined;
  providerDeploymentId?: string | string[] | undefined;
  providerAuthMethodId?: string | string[] | undefined;
  providerAuthCredentialsId?: string | string[] | undefined;
  providerConfigId?: string | string[] | undefined;
  createdAt?: { gt?: Date | undefined; lt?: Date | undefined } | undefined;
  updatedAt?: { gt?: Date | undefined; lt?: Date | undefined } | undefined;
};

export let mapManagementInstanceIntegrationsProvidersListQuery =
  /* @__PURE__ */ createMapper<ManagementInstanceIntegrationsProvidersListQuery>(
    [
      3,
      [
        [
          0,
          [
            1,
            [
              'integration_id',
              'provider_id',
              'provider_deployment_id',
              'provider_auth_method_id',
              'provider_auth_credentials_id',
              'provider_config_id',
              ['created_at', 1, 5],
              ['updated_at', 1, 5]
            ]
          ]
        ]
      ]
    ]
  );
