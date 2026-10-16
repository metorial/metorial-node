import { mapObject } from '@metorial/util-resource-mapper/compact';

export type ConsumersGetOutput = {
  object: 'consumer';
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export let mapConsumersGetOutput =
  /* @__PURE__ */ mapObject<ConsumersGetOutput>(
    ['image_url', 'user_id', 'created_at', 'updated_at'],
    1
  );
