import { mapObject } from '@metorial/util-resource-mapper/compact';

export type ManagementInstanceCallbacksCreateOutput = {
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
  createdAt: Date;
  updatedAt: Date;
};

export let mapManagementInstanceCallbacksCreateOutput =
  /* @__PURE__ */ mapObject<ManagementInstanceCallbacksCreateOutput>(
    [
      'integration_id',
      'integration_provider_id',
      ['provider', 0, 8],
      'created_at',
      'updated_at'
    ],
    1
  );

export type ManagementInstanceCallbacksCreateBody = {
  integrationId: string;
  integrationProviderId: string;
  name?: string | undefined;
  description?: string | null | undefined;
};

export let mapManagementInstanceCallbacksCreateBody =
  /* @__PURE__ */ mapObject<ManagementInstanceCallbacksCreateBody>([
    'integration_id',
    'integration_provider_id'
  ]);
