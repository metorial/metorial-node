import { mapObject } from '@metorial/util-resource-mapper/compact';

export type DashboardInstancePortalsConsumerGroupsGetOutput = {
  object: 'consumer.group';
  id: string;
  status: 'active' | 'archived' | 'deleted';
  name: string;
  description: string | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export let mapDashboardInstancePortalsConsumerGroupsGetOutput =
  /* @__PURE__ */ mapObject<DashboardInstancePortalsConsumerGroupsGetOutput>(
    ['is_default', 'created_at', 'updated_at'],
    1
  );
