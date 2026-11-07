# billing-engine: Answer Key

**Spoilers.** There are two bugs and seven failing tests.

**What this exercise tests:** working back from a wrong number through a
calculation pipeline, and grouping several failing tests by root cause
instead of chasing each one separately.

## Triage first

Seven failures look like a lot, but they fall into two groups:

| Group | Tests | Symptom |
|---|---|---|
| A | JPY invoice, charge request (JPY part), JPY formatting | Amounts are exactly **100×** too big, or formatted 100× too small |
| B | All proration tests except "same price" and "outside the period" | Amounts are slightly too big: 16/30 instead of 15/30, 31/30 instead of 30/30 |

Seeing that "exactly 100×" is a currency-exponent problem, and that "one day
too many" is an off-by-one in a date range, before opening any code is the
strongest early signal in this exercise.

## Bug 1: zero-decimal currencies are treated as two-decimal

**Where:** `src/currencies.js`, `minorUnitExponent()`

`getCurrency(code).exponent || DEFAULT_EXPONENT` replaces the falsy `0` for
JPY and KRW with `2`. `fromDecimal(1000, "JPY")` then gives 100000.

**Fix:** use `??` instead of `||`. Since every table entry has an exponent,
returning `getCurrency(code).exponent` directly works too.

**Narrowing it down:**
- The **smallest failing test** is `formats zero-decimal currencies`:
  `formatMoney(money(1100, "JPY"))` gives `¥11`. It touches only `format.js` →
  `toDecimal` → `minorUnitExponent`, so starting from it is the fastest route.
- **Red herring:** `format.js` reads `getCurrency(c).exponent` directly, so
  formatting decides on 0 decimals correctly while the conversion divides by 100.
- **KWD (exponent 3) passes,** which proves the exponent mechanism works in
  general and points at something special about `0`.
- **Good hypothesis to state:** "JPY amounts are off by 10² and USD isn't, so
  something treats JPY as having 2 decimals. Let me check what
  `minorUnitExponent('JPY')` returns." Running it in the debugger or a REPL
  confirms it in seconds.

**Senior signal:** points out that a falsy check on a field where `0` is
valid is a whole class of bug, and greps for other `||` defaults on numeric
fields. Also mentions that this bug would overcharge Japanese customers 100×
in production, which makes it a P0.

## Bug 2: proration counts one day too many

**Where:** `src/proration.js`, `remainingFraction()`

Periods are half-open `[start, end)`, as documented at the top of
`dates.js`. `daysBetween(changeDate, period.end)` therefore already counts the
change date. The `+ 1` counts it twice, which the plausible-sounding comment
above it hides.

**Fix:** remove the `+ 1`, and the comment along with it.

**Narrowing it down:**
- The **first-day test** is the giveaway: a change on day one should give a
  fraction of exactly 1, but the result is 31/30. A fraction over 1 is
  impossible, so the error is in how the fraction is computed.
- **The "same price" test passes** because the error cancels out: credit and
  charge are both wrong by the same fraction. That tells you the fraction is
  wrong, not the money math.
- `dates.test.js` passes, so `daysBetween` and `daysInPeriod` are correct.
  That isolates the bug to how `proration.js` uses them.

**Senior signal:** reads the convention in `dates.js` *before* changing
anything, rather than adding `+ 1` to the denominator as well (which makes
the first-day test pass but leaves the others wrong). Distrusts the
comment: comments describe intent, and the bug may be that the intent itself
is wrong.

## Suggested debugging flow

1. Run everything, read all failures, and group them (2 minutes, saves 20).
2. Pick the smallest failing test in each group.
3. Set a breakpoint in it, use Step Into to follow the value down, and watch
   where it first goes wrong.
4. Fix, rerun the **whole** suite, and confirm the group goes green with no
   new failures.
