export class SandboxAccessError extends Error {
  code: string;
  retryable: boolean;
  path?: string;

  constructor(
    code: string,
    message?: string,
    details: { retryable?: boolean; path?: string } = {}
  ) {
    super(message ?? code.replace(/_/g, ' '));
    this.name = 'SandboxAccessError';
    this.code = code;
    this.retryable = !!details.retryable;
    this.path = details.path;
  }
}

export class SandboxCommandError extends SandboxAccessError {
  constructor(code: string, message?: string, details: { retryable?: boolean } = {}) {
    super(code, message, details);
    this.name = 'SandboxCommandError';
  }
}

export let createClosedError = () =>
  new SandboxAccessError('closed', 'The sandbox connection was closed.');

export let createServerError = (
  raw: { code?: unknown; message?: unknown; path?: unknown; retryable?: unknown },
  ErrorClass: typeof SandboxAccessError = SandboxAccessError
) =>
  new ErrorClass(
    typeof raw.code == 'string' ? raw.code : 'unknown',
    typeof raw.message == 'string' ? raw.message : undefined,
    {
      retryable: raw.retryable === true,
      ...(typeof raw.path == 'string' && { path: raw.path })
    }
  );

let closeReasons: Record<string, string> = {
  machine_paused: 'The machine paused, so this connection was closed.',
  machine_restarting: 'The machine is restarting.',
  machine_terminated: 'The machine was terminated.',
  idle_timeout: 'This connection was closed after being idle.'
};

export let describeSocketClose = (code: number, reason: string) => {
  switch (code) {
    case 4401:
      return new SandboxAccessError('unauthorized', 'Access to the machine was rejected.', {
        retryable: true
      });
    case 4404:
      return new SandboxAccessError('not_found', 'This machine could not be found.');
    case 4410:
      return new SandboxAccessError('machine_terminated', closeReasons.machine_terminated);
    case 4429:
      return new SandboxAccessError('rate_limited', 'Too many connections to the machine.', {
        retryable: true
      });
    case 4503:
      return reason == 'machine_failed'
        ? new SandboxAccessError('machine_failed', 'The machine has failed.')
        : new SandboxAccessError('machine_unavailable', 'The machine is not available.', {
            retryable: true
          });
    case 1012: {
      let kind =
        reason == 'machine_terminated' || reason == 'machine_restarting'
          ? reason
          : 'machine_paused';
      return new SandboxAccessError(kind, closeReasons[kind], {
        retryable: kind != 'machine_terminated'
      });
    }
    case 1000:
      if (reason == 'idle_timeout') {
        return new SandboxAccessError('idle_timeout', closeReasons.idle_timeout, {
          retryable: true
        });
      }
  }

  return new SandboxAccessError('disconnected', 'The connection to the machine was lost.', {
    retryable: true
  });
};
