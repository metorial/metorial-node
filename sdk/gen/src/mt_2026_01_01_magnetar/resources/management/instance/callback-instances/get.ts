import { mapObject } from '@metorial/util-resource-mapper/compact';

export type ManagementInstanceCallbackInstancesGetOutput = {
  object: 'callback.instance';
  id: string;
  status: 'active' | 'archived' | 'deleted';
  callbackId: string;
  integrationInstanceId: string;
  integrationInstanceProviderId: string;
  createdAt: Date;
  updatedAt: Date;
};

export let mapManagementInstanceCallbackInstancesGetOutput =
  /* @__PURE__ */ mapObject<ManagementInstanceCallbackInstancesGetOutput>(
    [
      'callback_id',
      'integration_instance_id',
      'integration_instance_provider_id',
      'created_at',
      'updated_at'
    ],
    1
  );
