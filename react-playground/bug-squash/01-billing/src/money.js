import { getCurrency, minorUnitExponent } from "./currencies.js";

// A Money value is an immutable { amount, currency } pair where `amount` is an
// integer count of the currency's minor unit (cents for USD, yen for JPY).
//
// Never do arithmetic on decimal amounts. Convert once at the edge with
// fromDecimal() and keep everything else in integers.

export class CurrencyMismatchError extends Error {
  constructor(a, b) {
    super(`Cannot combine ${a} and ${b} amounts`);
    this.name = "CurrencyMismatchError";
  }
}

export function money(amount, currency) {
  if (!Number.isSafeInteger(amount)) {
    throw new TypeError(`Money amount must be a safe integer, got ${amount}`);
  }
  // Normalise -0 so that equality checks in callers behave.
  return Object.freeze({ amount: amount === 0 ? 0 : amount, currency: getCurrency(currency).code });
}

export function zero(currency) {
  return money(0, currency);
}

/** Converts a human decimal amount (19.99) into Money (1999 cents). */
export function fromDecimal(value, currency) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new TypeError(`Expected a finite number, got ${value}`);
  }

  const exponent = minorUnitExponent(currency);
  // toFixed sidesteps binary float drift: 19.99 * 100 === 1998.9999999999998.
  const [whole, fraction = ""] = Math.abs(value).toFixed(exponent).split(".");
  const amount = Number(whole + fraction);
  return money(value < 0 ? -amount : amount, currency);
}

/** Converts Money back into a human decimal amount. */
export function toDecimal(m) {
  return m.amount / 10 ** minorUnitExponent(m.currency);
}

function assertSameCurrency(a, b) {
  if (a.currency !== b.currency) throw new CurrencyMismatchError(a.currency, b.currency);
}

export function add(a, b) {
  assertSameCurrency(a, b);
  return money(a.amount + b.amount, a.currency);
}

export function subtract(a, b) {
  assertSameCurrency(a, b);
  return money(a.amount - b.amount, a.currency);
}

export function negate(m) {
  return money(-m.amount, m.currency);
}

export function sum(values, currency) {
  return values.reduce((total, value) => add(total, value), zero(currency));
}

export function min(a, b) {
  assertSameCurrency(a, b);
  return a.amount <= b.amount ? a : b;
}

export function isZero(m) {
  return m.amount === 0;
}

export function isNegative(m) {
  return m.amount < 0;
}

/**
 * Rounds half away from zero (2.5 -> 3, -2.5 -> -3), which is what most tax
 * authorities expect. The intermediate toFixed(9) absorbs float noise such as
 * 3000 * 0.0725 === 217.49999999999997.
 */
export function roundHalfAwayFromZero(x) {
  const cleaned = Number(Math.abs(x).toFixed(9));
  return Math.sign(x) * Math.round(cleaned);
}

/** Multiplies by a (possibly fractional) factor, rounding to the minor unit. */
export function multiply(m, factor) {
  return money(roundHalfAwayFromZero(m.amount * factor), m.currency);
}

/**
 * Splits `total` across `weights` so that the shares always add up to exactly
 * `total`. Leftover minor units go to the shares with the largest fractional
 * remainder (ties go to the earliest share).
 */
export function allocate(total, weights) {
  const weightSum = weights.reduce((acc, w) => acc + w, 0);
  if (weights.some((w) => w < 0) || weightSum <= 0) {
    throw new RangeError("allocate() needs non-negative weights with a positive sum");
  }

  const exact = weights.map((w) => (total.amount * w) / weightSum);
  const shares = exact.map((x) => Math.trunc(x));
  let remainder = total.amount - shares.reduce((acc, s) => acc + s, 0);

  const byRemainder = exact
    .map((x, index) => ({ index, fraction: Math.abs(x - shares[index]) }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index);

  const step = Math.sign(remainder);
  for (let k = 0; remainder !== 0; k++) {
    shares[byRemainder[k % byRemainder.length].index] += step;
    remainder -= step;
  }

  return shares.map((share) => money(share, total.currency));
}
