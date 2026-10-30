import {
  createMapper,
  mapObject
} from '@metorial/util-resource-mapper/compact';

export type DashboardInstanceProviderDeploymentsSetupSessionsEmailsCreateOutput =
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

export let mapDashboardInstanceProviderDeploymentsSetupSessionsEmailsCreateOutput =
  /* @__PURE__ */ createMapper<DashboardInstanceProviderDeploymentsSetupSessionsEmailsCreateOutput>(
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

export type DashboardInstanceProviderDeploymentsSetupSessionsEmailsCreateBody =
  {
    emails?: string[] | undefined;
    organizationMemberIds?: string[] | undefined;
  };

export let mapDashboardInstanceProviderDeploymentsSetupSessionsEmailsCreateBody =
  /* @__PURE__ */ mapObject<DashboardInstanceProviderDeploymentsSetupSessionsEmailsCreateBody>(
    ['organization_member_ids']
  );
