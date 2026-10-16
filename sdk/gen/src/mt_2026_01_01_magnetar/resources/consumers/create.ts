import {
  createMapper,
  mapObject
} from '@metorial/util-resource-mapper/compact';

export type ConsumersCreateOutput = {
  object: 'consumer';
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export let mapConsumersCreateOutput =
  /* @__PURE__ */ mapObject<ConsumersCreateOutput>(
    ['image_url', 'user_id', 'created_at', 'updated_at'],
    1
  );

export type ConsumersCreateBody = { name: string; email: string };

export let mapConsumersCreateBody =
  /* @__PURE__ */ createMapper<ConsumersCreateBody>(0);
