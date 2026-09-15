import { mtMap } from '@metorial/util-resource-mapper';

export type CallbackInstancesGetOutput = {
  object: 'callback.instance';
  id: string;
  status: 'active' | 'archived' | 'deleted';
  callbackId: string;
  integrationInstanceId: string;
  integrationInstanceProviderId: string;
  createdAt: Date;
  updatedAt: Date;
};

export let mapCallbackInstancesGetOutput =
  mtMap.object<CallbackInstancesGetOutput>({
    object: mtMap.objectField('object', mtMap.passthrough()),
    id: mtMap.objectField('id', mtMap.passthrough()),
    status: mtMap.objectField('status', mtMap.passthrough()),
    callbackId: mtMap.objectField('callback_id', mtMap.passthrough()),
    integrationInstanceId: mtMap.objectField(
      'integration_instance_id',
      mtMap.passthrough()
    ),
    integrationInstanceProviderId: mtMap.objectField(
      'integration_instance_provider_id',
      mtMap.passthrough()
    ),
    createdAt: mtMap.objectField('created_at', mtMap.date()),
    updatedAt: mtMap.objectField('updated_at', mtMap.date())
  });

