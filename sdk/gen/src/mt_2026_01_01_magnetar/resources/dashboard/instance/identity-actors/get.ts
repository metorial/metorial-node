import { mapObject } from '@metorial/util-resource-mapper/compact';

export type DashboardInstanceIdentityActorsGetOutput = {
  object: 'identity.actor';
  id: string;
  type: 'person' | 'agent';
  status: 'active' | 'archived' | 'deleted';
  name: string;
  description: string | null;
  metadata: Record<string, any> | null;
  agentId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export let mapDashboardInstanceIdentityActorsGetOutput =
  /* @__PURE__ */ mapObject<DashboardInstanceIdentityActorsGetOutput>(
    ['agent_id', 'created_at', 'updated_at'],
    1
  );
