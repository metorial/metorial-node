import { mapObject } from '@metorial/util-resource-mapper/compact';

export type DashboardInstanceIdentityActorsGetOutput = {
  object: 'identity.actor';
  id: string;
  type: 'person' | 'agent' | 'consumer' | 'organization_member';
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

export let mapDashboardInstanceIdentityActorsGetOutput =
  /* @__PURE__ */ mapObject<DashboardInstanceIdentityActorsGetOutput>(
    [
      'agent_id',
      'consumer_id',
      'default_identity_id',
      'created_at',
      'updated_at'
    ],
    1
  );
