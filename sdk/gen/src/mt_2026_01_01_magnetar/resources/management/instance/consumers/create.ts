import {
  createMapper,
  mapObject
} from '@metorial/util-resource-mapper/compact';

export type ManagementInstanceConsumersCreateOutput = {
  object: 'consumer';
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export let mapManagementInstanceConsumersCreateOutput =
  /* @__PURE__ */ mapObject<ManagementInstanceConsumersCreateOutput>(
    ['image_url', 'user_id', 'created_at', 'updated_at'],
    1
  );

export type ManagementInstanceConsumersCreateBody = {
  name: string;
  email: string;
};

export let mapManagementInstanceConsumersCreateBody =
  /* @__PURE__ */ createMapper<ManagementInstanceConsumersCreateBody>(0);
