import { mapObject } from '@metorial/util-resource-mapper/compact';

export type IdentityActorsDeleteOutput = {
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

export let mapIdentityActorsDeleteOutput =
  /* @__PURE__ */ mapObject<IdentityActorsDeleteOutput>(
    ['agent_id', 'created_at', 'updated_at'],
    1
  );
