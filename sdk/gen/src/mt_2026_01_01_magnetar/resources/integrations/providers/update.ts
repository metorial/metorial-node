import { mtMap } from '@metorial/util-resource-mapper';

export type IntegrationsProvidersUpdateOutput = {
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
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
};

export let mapIntegrationsProvidersUpdateOutput =
  mtMap.object<IntegrationsProvidersUpdateOutput>({
    object: mtMap.objectField('object', mtMap.passthrough()),
    id: mtMap.objectField('id', mtMap.passthrough()),
    status: mtMap.objectField('status', mtMap.passthrough()),
    integrationId: mtMap.objectField('integration_id', mtMap.passthrough()),
    name: mtMap.objectField('name', mtMap.passthrough()),
    description: mtMap.objectField('description', mtMap.passthrough()),
    metadata: mtMap.objectField('metadata', mtMap.passthrough()),
    toolFilter: mtMap.objectField(
      'tool_filter',
      mtMap.union([
        mtMap.unionOption(
          'object',
          mtMap.object({
            type: mtMap.objectField('type', mtMap.passthrough()),
            ignoreParentFilters: mtMap.objectField(
              'ignore_parent_filters',
              mtMap.passthrough()
            ),
            filters: mtMap.objectField(
              'filters',
              mtMap.array(
                mtMap.union([
                  mtMap.unionOption(
                    'object',
                    mtMap.object({
                      type: mtMap.objectField('type', mtMap.passthrough()),
                      keys: mtMap.objectField(
                        'keys',
                        mtMap.array(mtMap.passthrough())
                      ),
                      pattern: mtMap.objectField(
                        'pattern',
                        mtMap.passthrough()
                      ),
                      uris: mtMap.objectField(
                        'uris',
                        mtMap.array(mtMap.passthrough())
                      )
                    })
                  )
                ])
              )
            )
          })
        )
      ])
    ),
    providerId: mtMap.objectField('provider_id', mtMap.passthrough()),
    deploymentId: mtMap.objectField('deployment_id', mtMap.passthrough()),
    authMethodId: mtMap.objectField('auth_method_id', mtMap.passthrough()),
    authCredentialsId: mtMap.objectField(
      'auth_credentials_id',
      mtMap.passthrough()
    ),
    config: mtMap.objectField(
      'config',
      mtMap.object({
        object: mtMap.objectField('object', mtMap.passthrough()),
        id: mtMap.objectField('id', mtMap.passthrough()),
        isDefault: mtMap.objectField('is_default', mtMap.passthrough()),
        name: mtMap.objectField('name', mtMap.passthrough()),
        description: mtMap.objectField('description', mtMap.passthrough()),
        metadata: mtMap.objectField('metadata', mtMap.passthrough()),
        providerId: mtMap.objectField('provider_id', mtMap.passthrough()),
        createdAt: mtMap.objectField('created_at', mtMap.date()),
        updatedAt: mtMap.objectField('updated_at', mtMap.date())
      })
    ),
    createdAt: mtMap.objectField('created_at', mtMap.date()),
    updatedAt: mtMap.objectField('updated_at', mtMap.date()),
    archivedAt: mtMap.objectField('archived_at', mtMap.date())
  });

export type IntegrationsProvidersUpdateBody = {
  providerDeploymentId?: string | undefined;
  providerAuthMethodId?: string | null | undefined;
  providerAuthCredentialsId?: string | null | undefined;
  providerConfigId?: string | null | undefined;
  name?: string | undefined;
  description?: string | null | undefined;
  metadata?: Record<string, any> | null | undefined;
  toolFilters?:
    | (
        | { type: 'tool_keys'; keys: string[] }
        | { type: 'tool_regex'; pattern: string }
        | { type: 'resource_regex'; pattern: string }
        | { type: 'resource_uris'; uris: string[] }
        | { type: 'prompt_keys'; keys: string[] }
        | { type: 'prompt_regex'; pattern: string }
      )
    | (
        | { type: 'tool_keys'; keys: string[] }
        | { type: 'tool_regex'; pattern: string }
        | { type: 'resource_regex'; pattern: string }
        | { type: 'resource_uris'; uris: string[] }
        | { type: 'prompt_keys'; keys: string[] }
        | { type: 'prompt_regex'; pattern: string }
      )[]
    | null
    | undefined;
};

export let mapIntegrationsProvidersUpdateBody =
  mtMap.object<IntegrationsProvidersUpdateBody>({
    providerDeploymentId: mtMap.objectField(
      'provider_deployment_id',
      mtMap.passthrough()
    ),
    providerAuthMethodId: mtMap.objectField(
      'provider_auth_method_id',
      mtMap.passthrough()
    ),
    providerAuthCredentialsId: mtMap.objectField(
      'provider_auth_credentials_id',
      mtMap.passthrough()
    ),
    providerConfigId: mtMap.objectField(
      'provider_config_id',
      mtMap.passthrough()
    ),
    name: mtMap.objectField('name', mtMap.passthrough()),
    description: mtMap.objectField('description', mtMap.passthrough()),
    metadata: mtMap.objectField('metadata', mtMap.passthrough()),
    toolFilters: mtMap.objectField(
      'tool_filters',
      mtMap.union([
        mtMap.unionOption(
          'object',
          mtMap.object({
            type: mtMap.objectField('type', mtMap.passthrough()),
            keys: mtMap.objectField('keys', mtMap.array(mtMap.passthrough())),
            pattern: mtMap.objectField('pattern', mtMap.passthrough()),
            uris: mtMap.objectField('uris', mtMap.array(mtMap.passthrough()))
          })
        ),
        mtMap.unionOption(
          'array',
          mtMap.union([
            mtMap.unionOption(
              'object',
              mtMap.object({
                type: mtMap.objectField('type', mtMap.passthrough()),
                keys: mtMap.objectField(
                  'keys',
                  mtMap.array(mtMap.passthrough())
                ),
                pattern: mtMap.objectField('pattern', mtMap.passthrough()),
                uris: mtMap.objectField(
                  'uris',
                  mtMap.array(mtMap.passthrough())
                )
              })
            )
          ])
        )
      ])
    )
  });

