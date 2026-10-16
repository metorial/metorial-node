import { mapObject } from '@metorial/util-resource-mapper/compact';

export type IntegrationsInstanceGroupsProvidersSetOutput = {
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
};

export let mapIntegrationsInstanceGroupsProvidersSetOutput =
  /* @__PURE__ */ mapObject<IntegrationsInstanceGroupsProvidersSetOutput>(
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
    ],
    1
  );

export type IntegrationsInstanceGroupsProvidersSetBody = {
  toolFilters?:
    | (
        | { type: 'tool_keys'; keys: string[] }
        | { type: 'tool_categories'; keys: string[] }
        | { type: 'tool_regex'; pattern: string }
        | { type: 'resource_regex'; pattern: string }
        | { type: 'resource_uris'; uris: string[] }
        | { type: 'prompt_keys'; keys: string[] }
        | { type: 'prompt_regex'; pattern: string }
      )
    | (
        | { type: 'tool_keys'; keys: string[] }
        | { type: 'tool_categories'; keys: string[] }
        | { type: 'tool_regex'; pattern: string }
        | { type: 'resource_regex'; pattern: string }
        | { type: 'resource_uris'; uris: string[] }
        | { type: 'prompt_keys'; keys: string[] }
        | { type: 'prompt_regex'; pattern: string }
      )[]
    | null
    | undefined;
};

export let mapIntegrationsInstanceGroupsProvidersSetBody =
  /* @__PURE__ */ mapObject<IntegrationsInstanceGroupsProvidersSetBody>([
    'tool_filters'
  ]);
