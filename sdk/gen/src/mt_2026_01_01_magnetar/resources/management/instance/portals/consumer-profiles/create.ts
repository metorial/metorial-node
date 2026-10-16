import { createMapper } from '@metorial/util-resource-mapper/compact';

export type ManagementInstancePortalsConsumerProfilesCreateOutput = {
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
};

export let mapManagementInstancePortalsConsumerProfilesCreateOutput =
  /* @__PURE__ */ createMapper<ManagementInstancePortalsConsumerProfilesCreateOutput>(
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
    ],
    1
  );

export type ManagementInstancePortalsConsumerProfilesCreateBody = {
  email: string;
  name: string;
};

export let mapManagementInstancePortalsConsumerProfilesCreateBody =
  /* @__PURE__ */ createMapper<ManagementInstancePortalsConsumerProfilesCreateBody>(
    0
  );
