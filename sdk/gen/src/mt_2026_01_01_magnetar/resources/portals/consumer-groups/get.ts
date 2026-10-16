import { mapObject } from '@metorial/util-resource-mapper/compact';

export type PortalsConsumerGroupsGetOutput = {
  object: 'consumer.group';
  id: string;
  status: 'active' | 'archived' | 'deleted';
  name: string;
  description: string | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export let mapPortalsConsumerGroupsGetOutput =
  /* @__PURE__ */ mapObject<PortalsConsumerGroupsGetOutput>(
    ['is_default', 'created_at', 'updated_at'],
    1
  );
