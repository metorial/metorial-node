import { mapObject } from '@metorial/util-resource-mapper/compact';

export type ManagementInstanceIdentityActorsGetOutput = {
  object: 'identity.actor';
  id: string;
  type: 'person' | 'agent' | 'consumer';
  status: 'active' | 'archived' | 'deleted';
  name: string;
  description: string | null;
  metadata: Record<string, any> | null;
  agentId: string | null;
  consumerId: string | null;
  defaultIdentityId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export let mapManagementInstanceIdentityActorsGetOutput =
  /* @__PURE__ */ mapObject<ManagementInstanceIdentityActorsGetOutput>(
    [
      'agent_id',
      'consumer_id',
      'default_identity_id',
      'created_at',
      'updated_at'
    ],
    1
  );
