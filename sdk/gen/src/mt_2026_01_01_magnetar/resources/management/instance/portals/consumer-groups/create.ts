import { mapObject } from '@metorial/util-resource-mapper/compact';

export type ManagementInstancePortalsConsumerGroupsCreateOutput = {
  object: 'consumer.group';
  id: string;
  status: 'active' | 'archived' | 'deleted';
  name: string;
  description: string | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export let mapManagementInstancePortalsConsumerGroupsCreateOutput =
  /* @__PURE__ */ mapObject<ManagementInstancePortalsConsumerGroupsCreateOutput>(
    ['is_default', 'created_at', 'updated_at'],
    1
  );

export type ManagementInstancePortalsConsumerGroupsCreateBody = {
  name: string;
  description?: string | undefined;
  isDefault?: boolean | undefined;
};

export let mapManagementInstancePortalsConsumerGroupsCreateBody =
  /* @__PURE__ */ mapObject<ManagementInstancePortalsConsumerGroupsCreateBody>([
    'is_default'
  ]);
