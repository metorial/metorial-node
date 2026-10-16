import {
  createMapper,
  mapObject
} from '@metorial/util-resource-mapper/compact';

export type ManagementInstanceIdentityActorsUpdateOutput = {
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

export let mapManagementInstanceIdentityActorsUpdateOutput =
  /* @__PURE__ */ mapObject<ManagementInstanceIdentityActorsUpdateOutput>(
    ['agent_id', 'created_at', 'updated_at'],
    1
  );

export type ManagementInstanceIdentityActorsUpdateBody = {
  name?: string | undefined;
  description?: string | undefined;
  metadata?: Record<string, any> | undefined;
};

export let mapManagementInstanceIdentityActorsUpdateBody =
  /* @__PURE__ */ createMapper<ManagementInstanceIdentityActorsUpdateBody>(0);
