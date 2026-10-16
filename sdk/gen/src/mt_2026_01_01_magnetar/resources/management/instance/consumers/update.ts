import {
  createMapper,
  mapObject
} from '@metorial/util-resource-mapper/compact';

export type ManagementInstanceConsumersUpdateOutput = {
  object: 'consumer';
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export let mapManagementInstanceConsumersUpdateOutput =
  /* @__PURE__ */ mapObject<ManagementInstanceConsumersUpdateOutput>(
    ['image_url', 'user_id', 'created_at', 'updated_at'],
    1
  );

export type ManagementInstanceConsumersUpdateBody = {
  name?: string | undefined;
  email?: string | undefined;
};

export let mapManagementInstanceConsumersUpdateBody =
  /* @__PURE__ */ createMapper<ManagementInstanceConsumersUpdateBody>(0);
