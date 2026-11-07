import { getCurrency } from "./currencies.js";
import { toDecimal } from "./money.js";

const formatters = new Map();

function formatterFor(locale, currency) {
  const key = `${locale}|${currency}`;

  if (!formatters.has(key)) {
    const { exponent } = getCurrency(currency);
    formatters.set(
      key,
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: exponent,
        maximumFractionDigits: exponent,
      }),
    );
  }
  return formatters.get(key);
}

/** Formats Money for display, e.g. { amount: 1999, currency: "USD" } -> "$19.99". */
export function formatMoney(m, { locale = "en-US" } = {}) {
  return formatterFor(locale, m.currency).format(toDecimal(m));
}

/** Formats a tax rate for display, e.g. 0.0725 -> "7.25%". */
export function formatRate(rate, { locale = "en-US" } = {}) {
  return new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 3 }).format(rate);
}
