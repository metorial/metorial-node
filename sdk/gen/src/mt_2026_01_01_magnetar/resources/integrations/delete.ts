import { mtMap } from '@metorial/util-resource-mapper';

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
  }[];
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
};

export let mapIntegrationsDeleteOutput = mtMap.object<IntegrationsDeleteOutput>(
  {
    object: mtMap.objectField('object', mtMap.passthrough()),
    id: mtMap.objectField('id', mtMap.passthrough()),
    status: mtMap.objectField('status', mtMap.passthrough()),
    slug: mtMap.objectField('slug', mtMap.passthrough()),
    name: mtMap.objectField('name', mtMap.passthrough()),
    description: mtMap.objectField('description', mtMap.passthrough()),
    metadata: mtMap.objectField('metadata', mtMap.passthrough()),
    configuration: mtMap.objectField(
      'configuration',
      mtMap.object({
        canAttachCustomToolFilters: mtMap.objectField(
          'can_attach_custom_tool_filters',
          mtMap.passthrough()
        ),
        canAttachCustomProviderConfig: mtMap.objectField(
          'can_attach_custom_provider_config',
          mtMap.passthrough()
        ),
        canOverrideToolFilters: mtMap.objectField(
          'can_override_tool_filters',
          mtMap.passthrough()
        )
      })
    ),
    implementation: mtMap.objectField(
      'implementation',
      mtMap.union([
        mtMap.unionOption(
          'object',
          mtMap.object({
            type: mtMap.objectField('type', mtMap.passthrough()),
            providerTemplateId: mtMap.objectField(
              'provider_template_id',
              mtMap.passthrough()
            ),
            magicMcpServerId: mtMap.objectField(
              'magic_mcp_server_id',
              mtMap.passthrough()
            )
          })
        )
      ])
    ),
    providers: mtMap.objectField(
      'providers',
      mtMap.array(
        mtMap.object({
          object: mtMap.objectField('object', mtMap.passthrough()),
          id: mtMap.objectField('id', mtMap.passthrough()),
          status: mtMap.objectField('status', mtMap.passthrough()),
          integrationId: mtMap.objectField(
            'integration_id',
            mtMap.passthrough()
          ),
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
                            type: mtMap.objectField(
                              'type',
                              mtMap.passthrough()
                            ),
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
          authMethodId: mtMap.objectField(
            'auth_method_id',
            mtMap.passthrough()
          ),
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
              description: mtMap.objectField(
                'description',
                mtMap.passthrough()
              ),
              metadata: mtMap.objectField('metadata', mtMap.passthrough()),
              providerId: mtMap.objectField('provider_id', mtMap.passthrough()),
              createdAt: mtMap.objectField('created_at', mtMap.date()),
              updatedAt: mtMap.objectField('updated_at', mtMap.date())
            })
          ),
          createdAt: mtMap.objectField('created_at', mtMap.date()),
          updatedAt: mtMap.objectField('updated_at', mtMap.date()),
          archivedAt: mtMap.objectField('archived_at', mtMap.date())
        })
      )
    ),
    createdAt: mtMap.objectField('created_at', mtMap.date()),
    updatedAt: mtMap.objectField('updated_at', mtMap.date()),
    archivedAt: mtMap.objectField('archived_at', mtMap.date())
  }
);

