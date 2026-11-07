// ISO 4217 currencies supported by the billing engine.
//
// `exponent` is the number of digits after the decimal separator in the
// currency's minor unit: USD has cents (2), JPY has no minor unit (0), and
// KWD has fils (3). Every amount in this codebase is stored as an integer
// count of the minor unit, so `exponent` is what converts between the two.

const CURRENCIES = {
  USD: { code: "USD", exponent: 2 },
  EUR: { code: "EUR", exponent: 2 },
  GBP: { code: "GBP", exponent: 2 },
  CAD: { code: "CAD", exponent: 2 },
  AUD: { code: "AUD", exponent: 2 },
  JPY: { code: "JPY", exponent: 0 },
  KRW: { code: "KRW", exponent: 0 },
  KWD: { code: "KWD", exponent: 3 },
  BHD: { code: "BHD", exponent: 3 },
};

const DEFAULT_EXPONENT = 2;

export class UnsupportedCurrencyError extends Error {
  constructor(code) {
    super(`Unsupported currency: ${JSON.stringify(code)}`);
    this.name = "UnsupportedCurrencyError";
    this.code = code;
  }
}

function normalize(code) {
  return typeof code === "string" ? code.trim().toUpperCase() : code;
}

export function isSupportedCurrency(code) {
  return Object.hasOwn(CURRENCIES, normalize(code));
}

export function getCurrency(code) {
  const currency = CURRENCIES[normalize(code)];
  if (!currency) throw new UnsupportedCurrencyError(code);
  return currency;
}

export function minorUnitExponent(code) {
  return getCurrency(code).exponent ?? DEFAULT_EXPONENT;
}

export function isZeroDecimal(code) {
  return getCurrency(code).exponent === 0;
}
