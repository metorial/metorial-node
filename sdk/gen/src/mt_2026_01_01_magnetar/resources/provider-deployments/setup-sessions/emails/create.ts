import {
  createMapper,
  mapObject
} from '@metorial/util-resource-mapper/compact';

export type ProviderDeploymentsSetupSessionsEmailsCreateOutput = {
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

export let mapProviderDeploymentsSetupSessionsEmailsCreateOutput =
  /* @__PURE__ */ createMapper<ProviderDeploymentsSetupSessionsEmailsCreateOutput>(
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

export type ProviderDeploymentsSetupSessionsEmailsCreateBody = {
  emails?: string[] | undefined;
  organizationMemberIds?: string[] | undefined;
};

export let mapProviderDeploymentsSetupSessionsEmailsCreateBody =
  /* @__PURE__ */ mapObject<ProviderDeploymentsSetupSessionsEmailsCreateBody>([
    'organization_member_ids'
  ]);
