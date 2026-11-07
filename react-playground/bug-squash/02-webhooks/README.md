# webhook-delivery

Delivers events (such as `invoice.paid`) to the HTTPS endpoints that subscribe
to them. Every delivery is signed, failed deliveries are retried with
exponential backoff, every attempt is logged, and outcomes are published on
an event bus that metrics and health checks listen to.

## Layout

| File | What it does |
|---|---|
| `src/clock.js` | `RealClock` and a `FakeClock` for tests (time only moves on `advance()` / `runAll()`) |
| `src/event-bus.js` | Synchronous pub/sub with `on`, `once`, `off` and `"*"` wildcards |
| `src/signing.js` | HMAC-SHA256 `Webhook-Signature` headers and verification |
| `src/endpoints.js` | Endpoint registry with event-type patterns (`*`, `invoice.*`) |
| `src/transport.js` | `HttpTransport` (fetch), `DeliveryError`, and which errors are retryable |
| `src/retry.js` | Backoff schedule and `withRetry()` |
| `src/delivery-log.js` | Append-only log of every attempt |
| `src/dispatcher.js` | Ties it together: sign → send with retries → log → publish the outcome |
| `src/metrics.js` | Per-endpoint success/failure counters, fed by the bus |
| `src/service.js` | Production wiring, including the readiness health check |
| `support/fake-transport.js` | Scripted transport used by the tests |

## How time works in tests

Nothing in `src/` calls `setTimeout` directly; everything sleeps through the
injected clock. Tests start an operation, call `await clock.runAll()` to fire
every pending sleep in order, then await the result:

```js
const pending = dispatcher.dispatch(event);
await clock.runAll();
const summary = await pending;
```

## Running the tests

Requires Node 20 or later.

```bash
npm test
```

```bash
node --test test/dispatcher.test.js
```

## Your task

Some tests are failing. The tests (and `support/`) are correct; the bugs are
in `src/`. Find and fix them, explaining your reasoning as you go. There may
be more than one bug.

Don't open `SOLUTIONS.md` until you're done.
