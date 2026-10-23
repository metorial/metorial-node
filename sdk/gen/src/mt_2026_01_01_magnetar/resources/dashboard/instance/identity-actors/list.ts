import { createMapper } from '@metorial/util-resource-mapper/compact';

export type DashboardInstanceIdentityActorsListOutput = {
  items: {
    object: 'identity.actor';
    id: string;
    type: 'person' | 'agent' | 'consumer';
    status: 'active' | 'archived' | 'deleted';
    name: string;
    description: string | null;
    metadata: Record<string, any> | null;
    agentId: string | null;
    consumerId: string | null;
    defaultIdentityId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }[];
  pagination: { hasMoreBefore: boolean; hasMoreAfter: boolean };
};

export let mapDashboardInstanceIdentityActorsListOutput =
  /* @__PURE__ */ createMapper<DashboardInstanceIdentityActorsListOutput>(
    [
      7,
      [
        1,
        [
          'agent_id',
          'consumer_id',
          'default_identity_id',
          'created_at',
          'updated_at'
        ]
      ]
    ],
    1
  );

export type DashboardInstanceIdentityActorsListQuery = {
  limit?: number | undefined;
  after?: string | undefined;
  before?: string | undefined;
  cursor?: string | undefined;
  order?: 'asc' | 'desc' | undefined;
} & {
  search?: string | undefined;
  status?:
    | 'active'
    | 'archived'
    | 'deleted'
    | ('active' | 'archived' | 'deleted')[]
    | undefined;
  id?: string | string[] | undefined;
  agentId?: string | string[] | undefined;
  consumerId?: string | string[] | undefined;
  createdAt?: { gt?: Date | undefined; lt?: Date | undefined } | undefined;
  updatedAt?: { gt?: Date | undefined; lt?: Date | undefined } | undefined;
};

export let mapDashboardInstanceIdentityActorsListQuery =
  /* @__PURE__ */ createMapper<DashboardInstanceIdentityActorsListQuery>([
    3,
    [
      [
        0,
        [
          1,
          [
            'agent_id',
            'consumer_id',
            ['created_at', 1, 5],
            ['updated_at', 1, 5]
          ]
        ]
      ]
    ]
  ]);
