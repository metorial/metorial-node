import {
  createMapper,
  mapObject
} from '@metorial/util-resource-mapper/compact';

export type DashboardInstanceConsumersCreateOutput = {
  object: 'consumer';
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export let mapDashboardInstanceConsumersCreateOutput =
  /* @__PURE__ */ mapObject<DashboardInstanceConsumersCreateOutput>(
    ['image_url', 'user_id', 'created_at', 'updated_at'],
    1
  );

export type DashboardInstanceConsumersCreateBody = {
  name: string;
  email: string;
};

export let mapDashboardInstanceConsumersCreateBody =
  /* @__PURE__ */ createMapper<DashboardInstanceConsumersCreateBody>(0);
