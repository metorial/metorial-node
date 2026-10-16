import { mapObject } from '@metorial/util-resource-mapper/compact';

export type DashboardInstanceInstanceGetOutput = {
  object: 'organization.instance';
  id: string;
  slug: string;
  name: string;
  organizationId: string;
  sandboxId: string | null;
  type: 'development' | 'production';
  createdAt: Date;
  updatedAt: Date;
  project: {
    object: 'organization.project';
    id: string;
    status: 'active' | 'deleted';
    slug: string;
    name: string;
    organizationId: string;
    createdAt: Date;
    updatedAt: Date;
  };
};

export let mapDashboardInstanceInstanceGetOutput =
  /* @__PURE__ */ mapObject<DashboardInstanceInstanceGetOutput>(
    [
      'organization_id',
      'sandbox_id',
      'created_at',
      'updated_at',
      ['project', 0, [1, ['organization_id', 'created_at', 'updated_at']]]
    ],
    1
  );
