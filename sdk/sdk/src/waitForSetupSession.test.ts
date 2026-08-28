import { afterEach, describe, expect, it, vi } from 'vitest';
import { waitForSetupSessions } from './waitForSetupSession';

class FakeApiError extends Error {
  constructor(
    message: string,
    public readonly response: { status: number; code: string; message: string }
  ) {
    super(message);
  }
}

describe('waitForSetupSessions', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns immediately for an empty list', async () => {
    let getSession = vi.fn();
    await expect(waitForSetupSessions(getSession, [])).resolves.toEqual([]);
    expect(getSession).not.toHaveBeenCalled();
  });

  it('returns when every session is completed', async () => {
    let getSession = vi.fn(async (id: string) => ({ id, status: 'completed' }));
    await expect(waitForSetupSessions(getSession, { id: 'ss_1' })).resolves.toEqual([
      { id: 'ss_1', status: 'completed' }
    ]);
  });

  it('throws when a session fails', async () => {
    let getSession = vi.fn(async (id: string) => ({ id, status: 'failed' }));
    await expect(waitForSetupSessions(getSession, { id: 'ss_1' })).rejects.toThrow(
      '1 setup session(s) failed'
    );
  });

  it('throws client errors instead of polling until timeout', async () => {
    let getSession = vi.fn(async () => {
      throw new FakeApiError('unauthorized', {
        status: 401,
        code: 'unauthorized',
        message: 'Invalid API key'
      });
    });

    await expect(
      waitForSetupSessions(getSession, { id: 'ss_1' }, { timeout: 600000, pollInterval: 2000 })
    ).rejects.toThrow('unauthorized');
    expect(getSession).toHaveBeenCalledTimes(1);
  });

  it('retries transient poll failures until the session completes', async () => {
    vi.useFakeTimers();
    let attempts = 0;
    let getSession = vi.fn(async (id: string) => {
      attempts += 1;
      if (attempts === 1) throw new Error('network down');
      return { id, status: 'completed' };
    });

    let pending = waitForSetupSessions(getSession, { id: 'ss_1' }, { pollInterval: 2000 });
    await vi.advanceTimersByTimeAsync(2000);
    await expect(pending).resolves.toEqual([{ id: 'ss_1', status: 'completed' }]);
    expect(getSession).toHaveBeenCalledTimes(2);
  });
});
