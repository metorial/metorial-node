type SetupSessionStatus = {
  id: string;
  status: string;
};

export type WaitForSetupSessionOptions = {
  pollInterval?: number;
  timeout?: number;
};

export type SetupSessionGetter<T extends SetupSessionStatus = SetupSessionStatus> = (
  id: string
) => Promise<T>;

let isClientError = (error: unknown): boolean => {
  let status = (error as { response?: { status?: number } })?.response?.status;
  return typeof status === 'number' && status >= 400 && status < 500 && status !== 429;
};

let isTerminalWaitError = (error: unknown): boolean => {
  if (isClientError(error)) return true;
  if (!(error instanceof Error)) return false;
  return (
    error.message.includes('setup session') &&
    (error.message.includes('failed') || error.message.includes('timed out'))
  );
};

export async function waitForSetupSessions<T extends SetupSessionStatus>(
  getSession: SetupSessionGetter<T>,
  sessions: { id: string } | Array<{ id: string }>,
  options?: WaitForSetupSessionOptions
): Promise<T[]> {
  let sessionList = Array.isArray(sessions) ? sessions : [sessions];
  let pollInterval = Math.max(options?.pollInterval ?? 5000, 2000);
  let timeout = options?.timeout ?? 600000;
  let startTime = Date.now();

  if (sessionList.length === 0) {
    return [];
  }

  while (true) {
    if (Date.now() - startTime > timeout) {
      throw new Error(`Setup session timed out after ${timeout / 1000} seconds`);
    }

    try {
      let statuses = await Promise.all(sessionList.map(s => getSession(s.id)));

      let failed = statuses.filter(s => s.status === 'failed');
      if (failed.length > 0) {
        throw new Error(`${failed.length} setup session(s) failed`);
      }

      let allCompleted = statuses.every(s => s.status === 'completed');
      if (allCompleted) {
        return statuses;
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
    } catch (error) {
      if (isTerminalWaitError(error)) {
        throw error;
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
  }
}
