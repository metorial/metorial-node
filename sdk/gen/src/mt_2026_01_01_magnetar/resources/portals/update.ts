import { mapObject } from '@metorial/util-resource-mapper/compact';

export type PortalsUpdateOutput = {
  object: 'portal';
  id: string;
  status: 'active' | 'archived' | 'deleted';
  name: string;
  slug: string;
  description: string | null;
  allowConsumerSkillAuthoring: boolean;
  allowConsumerSkillPublishing: boolean;
  skillConfiguration: {
    object: 'portal.skill_configuration';
    id: string;
    isDefault: boolean;
    allowScripts: boolean;
    allowedFileExtensions: string[];
    allowNonStandardDirectories: boolean;
  };
  auth: {
    object: 'portal.auth';
    sessionExpiryTimeInSeconds: number;
    allowedRedirectUrlFilters: { url: string }[];
  };
  urls: { type: 'default' | 'namespace'; url: string }[];
  magicMcpUrl: string;
  createdAt: Date;
  updatedAt: Date;
};

export let mapPortalsUpdateOutput =
  /* @__PURE__ */ mapObject<PortalsUpdateOutput>(
    [
      'allow_consumer_skill_authoring',
      'allow_consumer_skill_publishing',
      [
        'skill_configuration',
        1,
        [
          1,
          [
            'is_default',
            'allow_scripts',
            'allowed_file_extensions',
            'allow_non_standard_directories'
          ]
        ]
      ],
      [
        'auth',
        0,
        [1, ['session_expiry_time_in_seconds', 'allowed_redirect_url_filters']]
      ],
      'magic_mcp_url',
      'created_at',
      'updated_at'
    ],
    1
  );

export type PortalsUpdateBody = {
  name?: string | undefined;
  description?: string | undefined;
  allowedRedirectUrlFilters?: { url: string }[] | undefined;
  sessionExpiryTimeInSeconds?: number | undefined;
  allowConsumerSkillAuthoring?: boolean | undefined;
  allowConsumerSkillPublishing?: boolean | undefined;
  skillConfiguration?:
    | {
        allowScripts?: boolean | undefined;
        allowedFileExtensions?: string[] | null | undefined;
        allowNonStandardDirectories?: boolean | undefined;
      }
    | undefined;
};

export let mapPortalsUpdateBody = /* @__PURE__ */ mapObject<PortalsUpdateBody>([
  'allowed_redirect_url_filters',
  'session_expiry_time_in_seconds',
  'allow_consumer_skill_authoring',
  'allow_consumer_skill_publishing',
  [
    'skill_configuration',
    1,
    [
      1,
      [
        'allow_scripts',
        'allowed_file_extensions',
        'allow_non_standard_directories'
      ]
    ]
  ]
]);
