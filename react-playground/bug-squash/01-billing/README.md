# billing-engine

Builds invoices for a subscription business: converts prices into integer
minor units, applies coupons, computes per-line tax, prorates mid-period plan
changes, and produces the request body for the payment processor.

## Layout

| File | What it does |
|---|---|
| `src/currencies.js` | Supported ISO currencies and their minor-unit exponent (USD 2, JPY 0, KWD 3) |
| `src/money.js` | Immutable `{ amount, currency }` values in integer minor units: conversion, arithmetic, rounding, `allocate()` |
| `src/format.js` | Display formatting via `Intl.NumberFormat` |
| `src/dates.js` | UTC calendar helpers; billing periods are half-open `[start, end)` |
| `src/tax.js` | Tax rates by region; tax-exclusive and tax-inclusive pricing |
| `src/discounts.js` | Coupons (percent or fixed amount, optionally product-restricted), spread across lines |
| `src/proration.js` | Credit/charge line items for a plan change partway through a period |
| `src/invoice.js` | `buildInvoice()`: items → lines → discounts → tax → totals |
| `src/charge.js` | `toChargeRequest()`: invoice → payment-processor request body |

Data flows roughly: `items` → `fromDecimal` → `applyCoupon` → `computeTax` →
totals → `toChargeRequest`.

## Running the tests

Requires Node 20 or later.

```bash
npm test
```

Run one file, or only tests whose name matches a pattern:

```bash
node --test test/invoice.test.js
```

```bash
node --test --test-name-pattern="JPY"
```

## Your task

Some tests are failing. The tests are correct; the bugs are in `src/`. Find
and fix them, explaining your reasoning as you go. There may be more than one
bug.

Don't open `SOLUTIONS.md` until you're done.
