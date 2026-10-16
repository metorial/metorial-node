import { mapObject } from '@metorial/util-resource-mapper/compact';

export type PortalsConsumerGroupsCreateOutput = {
  object: 'consumer.group';
  id: string;
  status: 'active' | 'archived' | 'deleted';
  name: string;
  description: string | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export let mapPortalsConsumerGroupsCreateOutput =
  /* @__PURE__ */ mapObject<PortalsConsumerGroupsCreateOutput>(
    ['is_default', 'created_at', 'updated_at'],
    1
  );

export type PortalsConsumerGroupsCreateBody = {
  name: string;
  description?: string | undefined;
  isDefault?: boolean | undefined;
};

export let mapPortalsConsumerGroupsCreateBody =
  /* @__PURE__ */ mapObject<PortalsConsumerGroupsCreateBody>(['is_default']);
