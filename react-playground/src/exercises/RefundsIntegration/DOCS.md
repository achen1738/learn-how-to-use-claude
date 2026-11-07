# Dashboard internals: reference

Everything you can build on. Amounts are always **integers in the currency's
minor unit** (cents for USD/EUR, whole yen for JPY).

## Payment

```js
{
  id: "py_007",
  amount: 5000,            // minor units
  amountRefunded: 1000,    // minor units
  currency: "usd",         // "usd" | "eur" | "jpy"
  status: "partially_refunded", // "succeeded" | "partially_refunded" | "refunded" | "failed" | "disputed"
  customer: { name, email },
  description: "Pro plan (monthly)",
  created: "2026-09-03T18:00:00.000Z",
}
```

## `lib/api.js`: payments API client

All functions return promises, take 300–900 ms, and throw `ApiError` on
failure.

| Function | Returns |
|---|---|
| `listPayments({ status = "all", cursor = null, limit = 20 })` | `{ data: Payment[], nextCursor }`, newest first. Pass `nextCursor` back as `cursor`; it's `null` on the last page. |
| `getPayment(id)` | `Payment` |
| `listRefunds(paymentId)` | `Refund[]`, newest first |
| `createRefund({ paymentId, amount, reason }, { idempotencyKey })` | `Refund`: `{ id, paymentId, amount, reason, created }` |

**Constants:** `PAYMENT_STATUSES`, and `REFUND_REASONS` =
`["requested_by_customer", "duplicate", "fraudulent"]`.

### `createRefund` and idempotency

`idempotencyKey` is **required**: any unique string, such as
`crypto.randomUUID()`. If a request with the same key and the same parameters
was already processed, the API **returns the original refund instead of
refunding again**. This makes retries safe, even when you can't tell whether
the first request reached the server. Reusing a key with **different**
parameters fails with `idempotency_key_reuse`.

`createRefund` returns only the refund, **not** the updated payment.

### `ApiError`

`error.code`, `error.status` (HTTP status, or `null` for network failures),
`error.retryable` (true when trying again later may work).

| `code` | Meaning |
|---|---|
| `network_error` | No response. The request may or may not have been processed. Retryable. |
| `rate_limited` | Too many requests (429). Retryable. |
| `payment_not_refundable` | The payment's status doesn't allow refunds |
| `amount_too_large` | More than what's left to refund |
| `invalid_amount` | Not a positive integer |
| `idempotency_key_reuse` | Same key, different parameters |
| `missing_idempotency_key` | No key given |
| `not_found` | No such payment |
| `invalid_request` | Anything else wrong with the request |

### Test helpers

- `resetApi()`: restore the initial data. Call it in `beforeEach`.
- `configureApi({ latencyMs: [0, 0] })`: make calls instant in tests.
- `failNextRefund(kind)`: make the next `createRefund` fail. `kind` is
  `"network"` (never reaches the server), `"response_lost"` (the server
  **processes** the refund, then the response is lost) or `"rate_limited"`.
  Calls queue up.

`test/api.test.js` shows all of these in use.

## `lib/money.js`

| Function | Example |
|---|---|
| `formatMoney(amount, currency)` | `formatMoney(1250, "usd")` → `"$12.50"`; `formatMoney(1250, "jpy")` → `"¥1,250"` |
| `toDecimalString(amount, currency)` | `toDecimalString(1250, "usd")` → `"12.50"` (for prefilling inputs) |
| `parseAmount(text, currency)` | `parseAmount("12.5", "usd")` → `1250`. Returns `null` for anything invalid: too many decimals, decimals in JPY, negatives, separators, empty. |
| `currencyExponent(currency)` | `2` for USD/EUR, `0` for JPY |

## `lib/usePaginatedPayments.js`

```js
const { payments, loading, error, hasMore, loadMore, reload, updatePayment } =
  usePaginatedPayments({ status, pageSize });
```

- `payments`: the payments loaded so far.
- `loadMore()`: fetch the next page. `reload()`: start again from page 1.
- **`updatePayment(id, updater)`**: replace one loaded payment **without any
  request**, for example after a mutation: `updatePayment(id, (p) => ({ ...p, ... }))`.

## `ui/index.jsx`: component library

| Component | Props |
|---|---|
| `Button` | `variant` (`"primary"` \| `"secondary"` \| `"danger"`), `loading` (disables it and shows "Working…"), plus any `<button>` props. Defaults to `type="button"`. |
| `Badge` | `tone` (`"neutral"` \| `"success"` \| `"warning"` \| `"danger"`) |
| `Banner` | `tone`, `onDismiss` (adds a close button). Danger banners are announced to screen readers. |
| `TextField` | `label`, `error`, `hint`, plus any `<input>` props |
| `Select` | `label`, `options` (`[{ value, label }]`), `error`, plus any `<select>` props |
| `Modal` | `open`, `title`, `onClose`, `dismissible` (default `true`; `false` disables Escape and backdrop clicks), `footer` (buttons, aligned right). Focus moves into the modal when it opens and returns afterwards. |
| `STATUS_DISPLAY` | `{ [status]: { tone, label } }`, the badge used for each payment status |
