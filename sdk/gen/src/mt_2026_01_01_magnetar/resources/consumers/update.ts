import {
  createMapper,
  mapObject
} from '@metorial/util-resource-mapper/compact';

export type ConsumersUpdateOutput = {
  object: 'consumer';
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export let mapConsumersUpdateOutput =
  /* @__PURE__ */ mapObject<ConsumersUpdateOutput>(
    ['image_url', 'user_id', 'created_at', 'updated_at'],
    1
  );

export type ConsumersUpdateBody = {
  name?: string | undefined;
  email?: string | undefined;
};

export let mapConsumersUpdateBody =
  /* @__PURE__ */ createMapper<ConsumersUpdateBody>(0);
