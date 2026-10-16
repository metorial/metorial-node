import { mapObject } from '@metorial/util-resource-mapper/compact';

export type DashboardInstanceConsumersGetOutput = {
  object: 'consumer';
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export let mapDashboardInstanceConsumersGetOutput =
  /* @__PURE__ */ mapObject<DashboardInstanceConsumersGetOutput>(
    ['image_url', 'user_id', 'created_at', 'updated_at'],
    1
  );
