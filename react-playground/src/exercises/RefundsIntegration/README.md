# Payments Dashboard: Refunds

**Time:** 75 minutes · **Format:** practice for a "frontend integration" interview

You've joined the team that builds the internal payments dashboard. Support
agents can already browse payments (open **Payments Refunds (Integration)** in the sidebar).
They now need to **refund payments** without leaving the dashboard.

Your job is to build that feature **on top of the existing code**: its API
client, money helpers, data hook and component library. Read
[`DOCS.md`](DOCS.md) before you start. Most of what you need already exists.

## Rules

- **Treat `lib/` and `ui/` as shared libraries owned by other teams.** Don't
  change them. If you think one has a bug, say so (as you would to an
  interviewer) and work around it.
- **The existing tests must keep passing.** Run them before you start, and
  again before you finish.
- Looking things up (MDN, React docs, Stack Overflow) is expected.

Run the tests from the `react-playground` folder:

```bash
node --test "src/exercises/RefundsIntegration/test/*.test.js"
```

The tests need Node 20 or later. Before you start, 9 pass and 6 fail; the 6
failures are Part 1.

---

## Part 1: Refund rules (`features/refundLogic.js`)

Implement the three functions. `test/refundLogic.test.js` checks them.

**`refundableAmount(payment)`** returns how much can still be refunded, in minor
units: `amount − amountRefunded` for `succeeded` and `partially_refunded`
payments, and `0` for every other status.

**`validateRefund(payment, { amountInput, reason })`** checks what the user
typed. `amountInput` is the raw text from the input, in the payment's
currency (`"25.50"` for USD, `"3000"` for JPY).

- Valid: returns `{ value: { amount, reason } }`, with `amount` in minor units.
- Invalid: returns `{ errors }`, with **every** field error at once:

| Situation | Error |
|---|---|
| payment can't be refunded at all | `{ form: "This payment can't be refunded" }` (no other errors) |
| amount isn't a valid amount for the currency | `{ amount: "Enter a valid amount" }` |
| amount is zero | `{ amount: "Amount must be greater than zero" }` |
| amount is more than what's left | `{ amount: "You can refund at most $40.00" }` (formatted in the payment's currency) |
| reason isn't one of the API's refund reasons | `{ reason: "Choose a reason" }` |

**`applyRefund(payment, refund)`** returns a **new** payment with the refund
applied: `amountRefunded` increases by the refund's amount, and `status`
becomes `refunded` if everything has now been refunded, otherwise
`partially_refunded`. It must not modify `payment`.

## Part 2: The refund form

In `PaymentDetails`:

1. Show a **Refund** button only when `refundableAmount(payment) > 0`.
2. It opens a modal titled **"Refund py_…"** with:
   - an **Amount** field, prefilled with the full remaining amount (as a plain
     number, like `40.00`), with the hint **"Up to $40.00"**;
   - a **Reason** select with a "Choose a reason" placeholder and the three
     reasons, labelled *Requested by customer*, *Duplicate* and *Fraudulent*;
   - **Cancel** and a submit button labelled **"Refund $25.50"**, showing the
     amount currently entered, or just **"Refund"** while the amount isn't
     valid.
3. Clicking submit runs `validateRefund` and shows its errors next to the
   fields (and `form` errors in a banner). Nothing is sent while there are
   errors.
4. Reopening the modal, or opening it for another payment, starts with a fresh
   form.

## Part 3: Submitting

1. Call `createRefund` with an **idempotency key**.
2. While the request is in flight, show the button as loading. The modal can't
   be closed, and **a double-click must not send two requests**.
3. **On success:**
   - update the payment **in both the table and the details panel, without
     reloading the list**;
   - close the modal;
   - show a success banner above the table: **"Refunded $25.50 on py_007"**.
4. **On failure,** keep the modal open with what the user entered, and show:

| `error.code` | Message | Also |
|---|---|---|
| `network_error`, `rate_limited` | "We couldn't reach the server. Try again." | Retrying must **never refund twice**, even if the server processed the first request ("Response lost" in Developer tools) |
| `amount_too_large`, `payment_not_refundable` | "This payment changed since you opened it. Check the amount and try again." | Fetch the latest version of the payment and show it everywhere |
| anything else | "Something went wrong (`<code>`)." | |

5. **Idempotency keys:** retrying the *same* refund must reuse its key. If the
   user **changes the amount or reason** before retrying, it's a new refund and
   needs a new key (reusing the old one is an `idempotency_key_reuse` error).

Use **Developer tools** under the details panel to queue failures and test
each case by hand.

## Part 4: Tests

Add tests for the new logic you wrote beyond Part 1, especially Part 3's retry
behaviour. Two cases we'll definitely look for:

- the response is lost, the user retries, and exactly **one** refund exists;
- the request fails, the user changes the amount, and the retry succeeds with a
  new key.

Tip: logic you pull out of the component into a plain function is much easier
to test with `node:test` and the fake API than logic inside a component.

## Stretch goals

- Show the payment's refund history (`listRefunds`) in the details panel, and
  update it after each refund.
- Explain whether you'd make refunds **optimistic** (update the UI before the
  server responds), and why.
- The table can be filtered by status. What should happen when a refund
  changes a payment's status so it no longer matches the filter? Discuss it,
  or implement your choice.

## What's being evaluated

| Area | What good looks like here |
|---|---|
| **Helping yourself** | Reading `DOCS.md`, finding `parseAmount`, `toDecimalString`, `updatePayment` and the `Modal` behaviour instead of rewriting them; using Developer tools and the tests to check your work |
| **Abstractions and code** | Logic kept out of components where it can be tested; small focused components; no duplicated state |
| **Correctness, testing and debugging** | Exact spec behaviour, idempotent retries, existing tests still green, new tests for new logic |
| **Collaboration** | Asking about unclear points (for example the filter question), explaining trade-offs as you go |

The answer key is in `SOLUTIONS.md`. Don't open it until you're done.
