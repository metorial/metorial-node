import { mapObject } from '@metorial/util-resource-mapper/compact';

export type IntegrationsDeleteOutput = {
  object: 'integration';
  id: string;
  status: 'active' | 'archived' | 'deleted';
  slug: string;
  name: string;
  description: string | null;
  metadata: Record<string, any> | null;
  configuration: {
    canAttachCustomToolFilters: boolean;
    canAttachCustomProviderConfig: boolean;
    canOverrideToolFilters: boolean;
    enableCallbackTools: boolean;
    useIntegrationNameInToolNames: boolean | null;
  };
  implementation:
    | { type: 'provider_template'; providerTemplateId: string }
    | { type: 'magic_mcp_server'; magicMcpServerId: string }
    | null;
  providers: {
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
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
};

export let mapIntegrationsDeleteOutput =
  /* @__PURE__ */ mapObject<IntegrationsDeleteOutput>(
    [
      [
        'configuration',
        0,
        [
          1,
          [
            'can_attach_custom_tool_filters',
            'can_attach_custom_provider_config',
            'can_override_tool_filters',
            'enable_callback_tools',
            'use_integration_name_in_tool_names'
          ]
        ]
      ],
      [
        'implementation',
        0,
        [3, [[0, [1, ['provider_template_id', 'magic_mcp_server_id']]]]]
      ],
      [
        'providers',
        0,
        [
          2,
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
        ]
      ],
      'created_at',
      'updated_at',
      'archived_at'
    ],
    1
  );
