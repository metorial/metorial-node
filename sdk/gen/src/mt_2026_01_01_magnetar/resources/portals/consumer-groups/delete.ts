import { mapObject } from '@metorial/util-resource-mapper/compact';

export type PortalsConsumerGroupsDeleteOutput = {
  object: 'consumer.group';
  id: string;
  status: 'active' | 'archived' | 'deleted';
  name: string;
  description: string | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export let mapPortalsConsumerGroupsDeleteOutput =
  /* @__PURE__ */ mapObject<PortalsConsumerGroupsDeleteOutput>(
    ['is_default', 'created_at', 'updated_at'],
    1
  );
