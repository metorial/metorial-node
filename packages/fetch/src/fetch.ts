import { delay } from './delay';
import { FetchRetryOptions } from './types';
import { withTimeout } from './withTimeout';

export let createFetchWithRetry = ({
  retries = 5,
  baseDelayMs = 1000,
  timeoutMs = 10000,
  backoffStrategy = 'linear',
  respectRateLimitReset = true
}: FetchRetryOptions = {}) => {
  return async function fetchWithRetry(
    input: string | URL | Request,
    init?: RequestInit
  ): Promise<Response> {
    let attempt = 0;
    let lastError: any;
    let lastResponse: any;

    while (attempt < retries) {
      try {
        let fetchPromise = fetch(input, init);
        let response = await withTimeout(fetchPromise, timeoutMs);

        if (response.status === 429 && respectRateLimitReset) {
          let reset = response.headers.get('RateLimit-Reset');
          if (reset) {
            let waitTime = parseInt(reset, 10);
            if (!isNaN(waitTime)) {
              await delay(waitTime * 1000);
              attempt++;
              continue;
            }
          }
        }

        if (response.status <= 299 || (response.status >= 400 && response.status <= 499)) {
          return response;
        }

        attempt++;
        lastResponse = response;
      } catch (err) {
        lastError = err;

        attempt++;
        if (attempt >= retries) break;

        let waitMs =
          backoffStrategy === 'exponential'
            ? baseDelayMs * Math.pow(2, attempt - 1)
            : baseDelayMs;

        await delay(waitMs);
      }
    }

    if (lastResponse) return lastResponse;
    throw lastError;
  };
};
