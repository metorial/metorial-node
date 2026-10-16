export interface SandboxAccessGrant {
  url: string;
  token: string;
  expiresAt?: Date | string | null;
}

export type SandboxAccessProvider = () => Promise<SandboxAccessGrant>;

let EXPIRY_MARGIN_MS = 30 * 1000;

export let createSandboxAccessCache = (getAccess: SandboxAccessProvider) => {
  let grant: SandboxAccessGrant | null = null;
  let pending: Promise<SandboxAccessGrant> | null = null;

  let isUsable = (candidate: SandboxAccessGrant) => {
    if (!candidate.expiresAt) return true;

    let expiresAt = new Date(candidate.expiresAt).getTime();
    return Number.isNaN(expiresAt) || expiresAt - Date.now() > EXPIRY_MARGIN_MS;
  };

  return {
    get: async () => {
      if (grant && isUsable(grant)) return grant;

      pending ??= getAccess()
        .then(next => (grant = next))
        .finally(() => {
          pending = null;
        });

      return pending;
    },

    invalidate: () => {
      grant = null;
    }
  };
};

export type SandboxAccessCache = ReturnType<typeof createSandboxAccessCache>;
