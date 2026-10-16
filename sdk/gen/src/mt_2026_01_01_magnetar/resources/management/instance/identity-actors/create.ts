import {
  createMapper,
  mapObject
} from '@metorial/util-resource-mapper/compact';

export type ManagementInstanceIdentityActorsCreateOutput = {
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

export let mapManagementInstanceIdentityActorsCreateOutput =
  /* @__PURE__ */ mapObject<ManagementInstanceIdentityActorsCreateOutput>(
    ['agent_id', 'created_at', 'updated_at'],
    1
  );

export type ManagementInstanceIdentityActorsCreateBody = {
  type: 'person' | 'agent';
  name: string;
  description?: string | undefined;
  metadata?: Record<string, any> | undefined;
};

export let mapManagementInstanceIdentityActorsCreateBody =
  /* @__PURE__ */ createMapper<ManagementInstanceIdentityActorsCreateBody>(0);
