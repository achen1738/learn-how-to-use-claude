# webhook-delivery: Answer Key

**Spoilers.** There are three independent bugs, each causing one failing test.

**What this exercise tests:** async control flow, and following a symptom
across module boundaries: the failing test is never in the file that contains
the bug.

## Bug 1: backoff waits twice as long as documented

**Failing test:** `retries a failing endpoint on the documented backoff schedule`
gives attempts at 0s, 2s, 6s instead of 0s, 1s, 3s.

**Where:** `src/retry.js`, `backoffDelay()`

The docstring says `failedAttempt` is 1-based and the first retry waits
`baseMs`, but the code computes `baseMs * factor ** failedAttempt`, which is
2000 for attempt 1.

**Fix:** `baseMs * factor ** (failedAttempt - 1)`.

**Narrowing it down:** the observed gaps are 2s and 4s; the expected gaps are
1s and 2s. "Every delay is doubled" means the exponent is off by one. Note the
comment at the top of `retry.js` spells out the intended schedule.

**Senior signal:** asks whether to fix the code or the documentation, and
concludes the code: the test and two comments agree on 1s/2s/4s. Also checks
that `maxMs` capping still works after the change.

## Bug 2: `dispatchAll` returns before anything is delivered

**Failing test:** `dispatchAll reports totals for the whole batch` returns
`{ delivered: 0, failed: 0 }`.

**Where:** `src/dispatcher.js`, `dispatchAll()`

`events.forEach(async (event) => ...)` starts every dispatch but doesn't wait
for any of them. `forEach` ignores the promises the callback returns, so
`mergeSummaries(summaries)` runs on an empty array. The deliveries do happen,
just after the result has already been returned.

**Fix:** `const summaries = await Promise.all(events.map((event) => this.dispatch(event)));`
or a `for...of` loop with `await` if events should go out one at a time.

**Narrowing it down:** set a breakpoint on `return mergeSummaries(...)` and
inspect `summaries`: it's `[]`. Then set a breakpoint inside the callback and
watch it run *after* the return.

**Senior signal:** discusses parallel versus sequential delivery. When
replaying after an outage, a large batch with `Promise.all` could overwhelm a
recovering endpoint, so a concurrency limit is worth mentioning.

## Bug 3: the first successful delivery is missing from metrics

**Failing test:** `metrics count every delivery outcome` shows we_1 with 2
successes instead of 3.

**Where:** `src/event-bus.js`, `emit()` together with `once()`

`service.js` registers `bus.once("delivery.succeeded", ...)` for the health
check *before* metrics subscribes. During the first emit, the `once` wrapper
calls `off()`, which `splice`s itself out of the very array `emit` is
iterating. Everything shifts down one index, so the iterator skips the
metrics listener. Later emits are fine because the `once` listener is gone.

**Fix:** iterate over a snapshot in `emit`: `for (const listener of [...listeners])`.
Node's own `EventEmitter` does the same thing.

**Narrowing it down:**
- **Count, don't guess.** Only the *first* event is missing, and only for
  successes, so ask what is special about the first `delivery.succeeded`.
  The answer is the health check's `once`.
- **The `event-bus.test.js` tests all pass,** including `once()`, because none
  of them combine `once` with another listener on the same event.
- **Strong experiment:** swap the order of the `once` and `metrics.attach`
  lines in `service.js`. If the test passes, that confirms it's an ordering
  interaction. That's a diagnosis, not the fix: the bus must not depend on
  registration order.

**Senior signal:** writes a focused unit test in `event-bus.test.js`
reproducing it (a `once` listener followed by an `on` listener, then a single
emit) before fixing. Spots that `off()` called from *inside* any listener has
the same problem.

## Suggested debugging flow

The three failures are independent; take them in any order, but say which one
you're picking and why. Bug 1 is the quickest win: the expected schedule is
written in comments, which makes it a good warm-up for showing your process.
