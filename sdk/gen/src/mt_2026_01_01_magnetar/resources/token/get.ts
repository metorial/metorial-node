import { mapObject } from '@metorial/util-resource-mapper/compact';

export type TokenGetOutput = {
  object: 'token';
  type:
    | 'fine_grained_token'
    | 'oauth_access_token'
    | 'unknown_token'
    | 'user_auth_token'
    | 'organization_management_token'
    | 'instance_access_token_secret'
    | 'instance_access_token_publishable';
  organization: {
    object: 'token.organization';
    id: string;
    name: string;
    slug: string;
  } | null;
  instance: {
    object: 'token.instance';
    id: string;
    name: string;
    slug: string;
    projectId: string;
  } | null;
  project: {
    object: 'token.project';
    id: string;
    name: string;
    slug: string;
  } | null;
  actor: {
    object: 'token.organization_actor';
    id: string;
    type: 'member' | 'machine_access';
    name: string;
  } | null;
  member: {
    object: 'token.organization_member';
    id: string;
    name: string;
  } | null;
  user: { object: 'token.user'; id: string; name: string } | null;
};

export let mapTokenGetOutput = /* @__PURE__ */ mapObject<TokenGetOutput>([
  ['instance', 0, [1, ['project_id']]]
]);
