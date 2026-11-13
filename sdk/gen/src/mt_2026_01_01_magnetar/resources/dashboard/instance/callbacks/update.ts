import { mapObject } from '@metorial/util-resource-mapper/compact';

export type DashboardInstanceCallbacksUpdateOutput = {
  object: 'callback';
  id: string;
  status: 'active' | 'archived' | 'deleted';
  name: string;
  description: string | null;
  metadata: Record<string, any> | null;
  integrationId: string;
  integrationProviderId: string;
  provider: {
    object: 'provider#preview';
    id: string;
    name: string;
    description: string | null;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
  };
  triggerGroupSelections: Record<string, Record<string, any>> | null;
  triggerGroups: {
    object: 'callback.trigger_group';
    key: string;
    name: string;
    description: string | null;
    selectionSchema: Record<string, any>;
    status: 'active' | 'selection_required';
  }[];
  createdAt: Date;
  updatedAt: Date;
};

export let mapDashboardInstanceCallbacksUpdateOutput =
  /* @__PURE__ */ mapObject<DashboardInstanceCallbacksUpdateOutput>(
    [
      'integration_id',
      'integration_provider_id',
      ['provider', 0, 8],
      'trigger_group_selections',
      ['trigger_groups', 1, [2, [1, ['selection_schema']]]],
      'created_at',
      'updated_at'
    ],
    1
  );

export type DashboardInstanceCallbacksUpdateBody = {
  name?: string | undefined;
  description?: string | null | undefined;
  metadata?: Record<string, any> | null | undefined;
  triggerGroupSelections?:
    Record<string, Record<string, any>> | null | undefined;
};

export let mapDashboardInstanceCallbacksUpdateBody =
  /* @__PURE__ */ mapObject<DashboardInstanceCallbacksUpdateBody>([
    'trigger_group_selections'
  ]);
