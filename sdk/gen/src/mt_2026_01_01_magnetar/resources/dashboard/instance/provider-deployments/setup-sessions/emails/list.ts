import { createMapper } from '@metorial/util-resource-mapper/compact';

export type DashboardInstanceProviderDeploymentsSetupSessionsEmailsListOutput =
  {
    items: {
      object: 'provider.setup_session.email';
      id: string;
      deduplicated: boolean;
      setupSessionId: string;
      recipientEmail: string | null;
      organizationMemberId: string | null;
      createdAt: Date;
    }[];
    pagination: { hasMoreBefore: boolean; hasMoreAfter: boolean };
  };

export let mapDashboardInstanceProviderDeploymentsSetupSessionsEmailsListOutput =
  /* @__PURE__ */ createMapper<DashboardInstanceProviderDeploymentsSetupSessionsEmailsListOutput>(
    [
      7,
      [
        1,
        [
          'setup_session_id',
          'recipient_email',
          'organization_member_id',
          'created_at'
        ]
      ]
    ],
    1
  );

export type DashboardInstanceProviderDeploymentsSetupSessionsEmailsListQuery = {
  limit?: number | undefined;
  after?: string | undefined;
  before?: string | undefined;
  cursor?: string | undefined;
  order?: 'asc' | 'desc' | undefined;
} & {};

export let mapDashboardInstanceProviderDeploymentsSetupSessionsEmailsListQuery =
  /* @__PURE__ */ createMapper<DashboardInstanceProviderDeploymentsSetupSessionsEmailsListQuery>(
    0
  );
