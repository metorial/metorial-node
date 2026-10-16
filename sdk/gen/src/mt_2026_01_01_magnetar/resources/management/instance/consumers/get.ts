import { mapObject } from '@metorial/util-resource-mapper/compact';

export type ManagementInstanceConsumersGetOutput = {
  object: 'consumer';
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export let mapManagementInstanceConsumersGetOutput =
  /* @__PURE__ */ mapObject<ManagementInstanceConsumersGetOutput>(
    ['image_url', 'user_id', 'created_at', 'updated_at'],
    1
  );
