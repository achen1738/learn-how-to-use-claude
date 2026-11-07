# Refunds: answer key

**Spoilers.** One reasonable solution, the traps built into the exercise, and
what an interviewer would note.

## Part 1: reference implementation

```js
import { REFUND_REASONS } from "../lib/api.js";
import { formatMoney, parseAmount } from "../lib/money.js";

const REFUNDABLE = new Set(["succeeded", "partially_refunded"]);

export function refundableAmount(payment) {
  return REFUNDABLE.has(payment.status) ? payment.amount - payment.amountRefunded : 0;
}

export function validateRefund(payment, { amountInput, reason }) {
  const remaining = refundableAmount(payment);
  if (remaining === 0) return { errors: { form: "This payment can't be refunded" } };

  const errors = {};
  const amount = parseAmount(amountInput, payment.currency);
  if (amount === null) errors.amount = "Enter a valid amount";
  else if (amount === 0) errors.amount = "Amount must be greater than zero";
  else if (amount > remaining) errors.amount = `You can refund at most ${formatMoney(remaining, payment.currency)}`;
  if (!REFUND_REASONS.includes(reason)) errors.reason = "Choose a reason";

  return Object.keys(errors).length ? { errors } : { value: { amount, reason } };
}

export function applyRefund(payment, refund) {
  const amountRefunded = payment.amountRefunded + refund.amount;
  return { ...payment, amountRefunded, status: amountRefunded === payment.amount ? "refunded" : "partially_refunded" };
}
```

**Traps in Part 1:**
- **Writing your own amount parsing** (`parseFloat(input) * 100`). It breaks on
  JPY (100× too much), accepts `"12.505"` and `"1e3"`, and has float errors
  (`19.99 * 100 = 1998.9999…`). `parseAmount` already handles all of this.
  Finding it is the "help yourself" signal.
- **Formatting the maximum by hand** (`"$" + remaining / 100`). Wrong for EUR
  and JPY. Use `formatMoney`.
- **Hard-coding the reasons** instead of importing `REFUND_REASONS`.
- **Returning only the first error.** The spec asks for every field error at
  once.

## Part 3: the retry logic, pulled out so it can be tested

The tricky requirement is "reuse the key for the same refund, use a new key
when the amount or reason changes". Keep a key per **attempt identity**:

```js
// features/refundSubmitter.js
export function createRefundSubmitter({ createRefund, newKey = () => crypto.randomUUID() }) {
  let current = null; // { fingerprint, key }

  return function submit(payment, { amount, reason }) {
    const fingerprint = `${payment.id}|${amount}|${reason}`;
    if (current?.fingerprint !== fingerprint) current = { fingerprint, key: newKey() };
    return createRefund({ paymentId: payment.id, amount, reason }, { idempotencyKey: current.key });
  };
}

export function refundErrorMessage(error) {
  switch (error?.code) {
    case "network_error":
    case "rate_limited":
      return "We couldn't reach the server. Try again.";
    case "amount_too_large":
    case "payment_not_refundable":
      return "This payment changed since you opened it. Check the amount and try again.";
    default:
      return `Something went wrong (${error?.code ?? "unknown"}).`;
  }
}
```

Create one submitter **each time the modal opens** (for example in a `useRef`
reset when the modal opens, or with `useState(() => createRefundSubmitter(...))`
inside a modal component that remounts per payment).

**The two required tests:**

```js
import { beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import * as api from "../lib/api.js";
import { createRefundSubmitter } from "../features/refundSubmitter.js";

beforeEach(() => {
  api.resetApi();
  api.configureApi({ latencyMs: [0, 0] });
});

test("retrying after a lost response refunds once", async () => {
  const payment = await api.getPayment("py_001");
  const submit = createRefundSubmitter({ createRefund: api.createRefund });
  api.failNextRefund("response_lost");

  await assert.rejects(submit(payment, { amount: 100, reason: "duplicate" }));
  const refund = await submit(payment, { amount: 100, reason: "duplicate" });

  assert.equal((await api.listRefunds(payment.id)).length, 1);
  assert.equal(refund.amount, 100);
});

test("changing the amount after a failure uses a new key", async () => {
  const payment = await api.getPayment("py_001");
  const submit = createRefundSubmitter({ createRefund: api.createRefund });
  api.failNextRefund("response_lost");

  await assert.rejects(submit(payment, { amount: 100, reason: "duplicate" }));
  const refund = await submit(payment, { amount: 50, reason: "duplicate" }); // would be idempotency_key_reuse with the old key

  assert.equal(refund.amount, 50);
  assert.equal((await api.listRefunds(payment.id)).length, 2);
});
```

(Check `py_001` is refundable in the seed data first, or pick one with
`listPayments({ status: "succeeded" })`.)

## Part 3: wiring it into the UI

- **`PaymentDetails` needs more than `payment`.** It has to update the list and
  show a banner owned by the dashboard. Pass down `updatePayment` (already
  returned by the hook, though the dashboard doesn't destructure it yet) and an
  `onRefunded(payment, refund)` callback. The banner state lives in
  `PaymentsDashboard`.
- **Update with the functional form:** `updatePayment(id, (p) => applyRefund(p, refund))`.
  Using the `payment` captured when the modal opened would overwrite anything
  that changed in the meantime.
- **Table and details stay in sync for free,** because the details panel
  already looks the payment up by `selectedId` in `payments`. The trap is
  copying the payment into separate state when the modal opens and
  rendering the details from that copy, which then goes stale.
- **Double submit:** `loading` on the `Button` disables it after the next
  render, but two very fast clicks can both run before that. Guard with a ref
  (`if (inFlight.current) return`) or check a submitting state set
  synchronously before the `await`.
- **`dismissible={!submitting}`** on the `Modal`, so it can't close while a
  request is in flight.
- **Fresh form per open:** render the form as its own component with
  `key={payment.id}` (or reset its state when the modal opens), so a previous
  attempt's values and errors don't leak into the next one.
- **`amount_too_large` / `payment_not_refundable`:** `getPayment(id)` then
  `updatePayment(id, () => fresh)`. Keep the modal open; the hint and maximum
  now show the new remaining amount.

## Stretch answers

- **Optimistic refunds? No.** It's money: showing "Refunded" to a support agent
  while the request might fail could lead them to tell a customer the money is
  on its way when it isn't. A one-second wait with a loading button is the
  right trade.
- **Filter mismatch:** a payment refunded while filtering "Succeeded" no longer
  matches. Removing it immediately is technically accurate, but the row the
  agent just acted on vanishes and the details panel closes. Keeping it until
  the next reload, with its updated badge, is usually better UX. Either way,
  **ask the interviewer.** Asking is the collaboration signal.

## How an interviewer would grade it

| Strong | Weak |
|---|---|
| Reads DOCS.md first; reuses `parseAmount`, `formatMoney`, `toDecimalString`, `REFUND_REASONS`, `updatePayment` | Reimplements parsing or formatting; reloads the whole list after each refund |
| Pure logic in plain modules with tests; components stay thin | Validation and retry logic inline in event handlers, untested |
| Same key on retry, new key on change, with a test proving one refund after "response lost" | New key on every click (double refunds), or one key forever (`idempotency_key_reuse`) |
| Runs the existing tests before and after; uses Developer tools to check each error path | Only tests the happy path by hand |
| Talks through trade-offs (optimistic or not, the filter question) and asks when the spec is silent | Silently picks behaviour the spec doesn't define |
