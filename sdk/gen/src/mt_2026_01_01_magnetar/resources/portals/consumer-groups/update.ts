import { mapObject } from '@metorial/util-resource-mapper/compact';

export type PortalsConsumerGroupsUpdateOutput = {
  object: 'consumer.group';
  id: string;
  status: 'active' | 'archived' | 'deleted';
  name: string;
  description: string | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export let mapPortalsConsumerGroupsUpdateOutput =
  /* @__PURE__ */ mapObject<PortalsConsumerGroupsUpdateOutput>(
    ['is_default', 'created_at', 'updated_at'],
    1
  );

export type PortalsConsumerGroupsUpdateBody = {
  name?: string | undefined;
  description?: string | undefined;
  isDefault?: boolean | undefined;
};

export let mapPortalsConsumerGroupsUpdateBody =
  /* @__PURE__ */ mapObject<PortalsConsumerGroupsUpdateBody>(['is_default']);
