import { createMapper } from '@metorial/util-resource-mapper/compact';

export type PortalsConsumerProfilesListOutput = {
  items: ({
    object: 'consumer.profile';
    id: string;
    name: string;
    email: string;
    imageUrl: string;
    consumerId: string;
    userId: string | null;
    status: 'active' | 'invited';
    createdAt: Date;
    updatedAt: Date;
  } & {
    groups:
      | {
          object: 'consumer.profile.group_assignment';
          group: {
            object: 'consumer.group';
            id: string;
            status: 'active' | 'archived' | 'deleted';
            name: string;
            description: string | null;
            isDefault: boolean;
            createdAt: Date;
            updatedAt: Date;
          };
          assignedVia: 'default' | 'manual' | 'sso' | 'user';
        }[]
      | null;
  })[];
  pagination: { hasMoreBefore: boolean; hasMoreAfter: boolean };
};

export let mapPortalsConsumerProfilesListOutput =
  /* @__PURE__ */ createMapper<PortalsConsumerProfilesListOutput>(
    [
      7,
      [
        3,
        [
          [
            0,
            [
              1,
              [
                'image_url',
                'consumer_id',
                'user_id',
                'created_at',
                'updated_at',
                [
                  'groups',
                  0,
                  [
                    2,
                    [
                      1,
                      [
                        [
                          'group',
                          0,
                          [1, ['is_default', 'created_at', 'updated_at']]
                        ],
                        'assigned_via'
                      ]
                    ]
                  ]
                ]
              ]
            ]
          ]
        ]
      ]
    ],
    1
  );

export type PortalsConsumerProfilesListQuery = {
  limit?: number | undefined;
  after?: string | undefined;
  before?: string | undefined;
  cursor?: string | undefined;
  order?: 'asc' | 'desc' | undefined;
} & {
  search?: string | undefined;
  email?: string | string[] | undefined;
  consumerGroupId?: string | undefined;
  status?: 'active' | 'invited' | ('active' | 'invited')[] | undefined;
};

export let mapPortalsConsumerProfilesListQuery =
  /* @__PURE__ */ createMapper<PortalsConsumerProfilesListQuery>([
    3,
    [[0, [1, ['consumer_group_id']]]]
  ]);
