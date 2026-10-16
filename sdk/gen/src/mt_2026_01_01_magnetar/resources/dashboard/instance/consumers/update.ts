import {
  createMapper,
  mapObject
} from '@metorial/util-resource-mapper/compact';

export type DashboardInstanceConsumersUpdateOutput = {
  object: 'consumer';
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export let mapDashboardInstanceConsumersUpdateOutput =
  /* @__PURE__ */ mapObject<DashboardInstanceConsumersUpdateOutput>(
    ['image_url', 'user_id', 'created_at', 'updated_at'],
    1
  );

export type DashboardInstanceConsumersUpdateBody = {
  name?: string | undefined;
  email?: string | undefined;
};

export let mapDashboardInstanceConsumersUpdateBody =
  /* @__PURE__ */ createMapper<DashboardInstanceConsumersUpdateBody>(0);
