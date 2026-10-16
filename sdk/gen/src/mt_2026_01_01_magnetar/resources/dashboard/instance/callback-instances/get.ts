import { mapObject } from '@metorial/util-resource-mapper/compact';

export type DashboardInstanceCallbackInstancesGetOutput = {
  object: 'callback.instance';
  id: string;
  status: 'active' | 'archived' | 'deleted';
  callbackId: string;
  integrationInstanceId: string;
  integrationInstanceProviderId: string;
  createdAt: Date;
  updatedAt: Date;
};

export let mapDashboardInstanceCallbackInstancesGetOutput =
  /* @__PURE__ */ mapObject<DashboardInstanceCallbackInstancesGetOutput>(
    [
      'callback_id',
      'integration_instance_id',
      'integration_instance_provider_id',
      'created_at',
      'updated_at'
    ],
    1
  );
