import { test } from "node:test";
import assert from "node:assert/strict";
import { FakeClock, withRetry } from "../src/index.js";

function failingTimes(n, error = new Error("nope")) {
  let calls = 0;
  return async () => {
    calls++;
    if (calls <= n) throw error;
    return `ok after ${calls}`;
  };
}

test("returns the value on first success without sleeping", async () => {
  const clock = new FakeClock();
  const outcome = await withRetry(async () => 42, { clock, maxAttempts: 3 });
  assert.deepEqual(outcome, { ok: true, value: 42, attempts: 1 });
  assert.equal(clock.pendingTimers, 0);
});

test("keeps trying until the operation succeeds", async () => {
  const clock = new FakeClock();
  const pending = withRetry(failingTimes(2), { clock, maxAttempts: 5 });
  await clock.runAll();
  assert.deepEqual(await pending, { ok: true, value: "ok after 3", attempts: 3 });
});

test("gives up after maxAttempts", async () => {
  const clock = new FakeClock();
  const pending = withRetry(failingTimes(10), { clock, maxAttempts: 3 });
  await clock.runAll();
  const outcome = await pending;
  assert.equal(outcome.ok, false);
  assert.equal(outcome.attempts, 3);
});

test("does not retry errors that aren't retryable", async () => {
  const clock = new FakeClock();
  const outcome = await withRetry(failingTimes(10), { clock, maxAttempts: 3, isRetryable: () => false });
  assert.equal(outcome.attempts, 1);
});
