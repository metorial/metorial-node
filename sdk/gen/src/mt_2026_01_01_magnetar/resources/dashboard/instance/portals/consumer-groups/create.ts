import { mapObject } from '@metorial/util-resource-mapper/compact';

export type DashboardInstancePortalsConsumerGroupsCreateOutput = {
  object: 'consumer.group';
  id: string;
  status: 'active' | 'archived' | 'deleted';
  name: string;
  description: string | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export let mapDashboardInstancePortalsConsumerGroupsCreateOutput =
  /* @__PURE__ */ mapObject<DashboardInstancePortalsConsumerGroupsCreateOutput>(
    ['is_default', 'created_at', 'updated_at'],
    1
  );

export type DashboardInstancePortalsConsumerGroupsCreateBody = {
  name: string;
  description?: string | undefined;
  isDefault?: boolean | undefined;
};

export let mapDashboardInstancePortalsConsumerGroupsCreateBody =
  /* @__PURE__ */ mapObject<DashboardInstancePortalsConsumerGroupsCreateBody>([
    'is_default'
  ]);
