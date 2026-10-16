import {
  createMapper,
  mapObject
} from '@metorial/util-resource-mapper/compact';

export type PortalsConsumerProfilesUnassignGroupsOutput = {
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

export let mapPortalsConsumerProfilesUnassignGroupsOutput =
  /* @__PURE__ */ createMapper<PortalsConsumerProfilesUnassignGroupsOutput>(
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

export type PortalsConsumerProfilesUnassignGroupsBody = { groupIds: string[] };

export let mapPortalsConsumerProfilesUnassignGroupsBody =
  /* @__PURE__ */ mapObject<PortalsConsumerProfilesUnassignGroupsBody>([
    'group_ids'
  ]);
