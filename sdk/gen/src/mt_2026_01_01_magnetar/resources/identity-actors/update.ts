import {
  createMapper,
  mapObject
} from '@metorial/util-resource-mapper/compact';

export type IdentityActorsUpdateOutput = {
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

export let mapIdentityActorsUpdateOutput =
  /* @__PURE__ */ mapObject<IdentityActorsUpdateOutput>(
    [
      'agent_id',
      'consumer_id',
      'default_identity_id',
      'created_at',
      'updated_at'
    ],
    1
  );

export type IdentityActorsUpdateBody = {
  name?: string | undefined;
  description?: string | undefined;
  metadata?: Record<string, any> | undefined;
};

export let mapIdentityActorsUpdateBody =
  /* @__PURE__ */ createMapper<IdentityActorsUpdateBody>(0);
