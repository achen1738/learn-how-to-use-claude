// Retries with exponential backoff.
//
// With the defaults a failing delivery is attempted at t = 0s, 1s, 3s and 7s:
// waits of 1s, 2s and 4s between attempts.

export const DEFAULT_BACKOFF = Object.freeze({ baseMs: 1000, factor: 2, maxMs: 60_000 });

/**
 * How long to wait before the next attempt, given the 1-based number of the
 * attempt that just failed. The first retry waits `baseMs`, each later retry
 * waits `factor` times longer than the one before, and no wait exceeds `maxMs`.
 */
export function backoffDelay(failedAttempt, { baseMs, factor, maxMs } = DEFAULT_BACKOFF) {
  return Math.min(maxMs, baseMs * factor ** (failedAttempt - 1));
}

/**
 * Calls `operation(attempt)` until it resolves, the error is not retryable, or
 * `maxAttempts` is reached. Never throws; the outcome says what happened.
 *
 * @returns {Promise<{ok: true, value: unknown, attempts: number} | {ok: false, error: unknown, attempts: number}>}
 */
export async function withRetry(
  operation,
  { clock, maxAttempts, backoff = DEFAULT_BACKOFF, isRetryable = () => true },
) {
  if (!(maxAttempts >= 1))
    throw new RangeError(`maxAttempts must be at least 1, got ${maxAttempts}`);

  for (let attempt = 1; ; attempt++) {
    try {
      const value = await operation(attempt);
      return { ok: true, value, attempts: attempt };
    } catch (error) {
      if (attempt >= maxAttempts || !isRetryable(error)) {
        return { ok: false, error, attempts: attempt };
      }
      await clock.sleep(backoffDelay(attempt, backoff));
    }
  }
}
