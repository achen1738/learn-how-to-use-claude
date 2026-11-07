// Money helpers. All amounts are integers in the currency's smallest unit
// ("minor unit"): cents for USD/EUR/GBP, whole yen for JPY.
//
// Documented in DOCS.md.

const EXPONENTS = { usd: 2, eur: 2, gbp: 2, jpy: 0 };

export function currencyExponent(currency) {
  const exponent = EXPONENTS[String(currency).toLowerCase()];
  if (exponent === undefined) throw new RangeError(`Unsupported currency: ${currency}`);
  return exponent;
}

const formatters = new Map();

/** formatMoney(1250, "usd") === "$12.50";  formatMoney(1250, "jpy") === "¥1,250" */
export function formatMoney(amount, currency, locale = "en-US") {
  const key = `${locale}|${currency}`;
  if (!formatters.has(key)) {
    const exponent = currencyExponent(currency);
    formatters.set(
      key,
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency.toUpperCase(),
        minimumFractionDigits: exponent,
        maximumFractionDigits: exponent,
      }),
    );
  }
  return formatters.get(key).format(amount / 10 ** currencyExponent(currency));
}

/**
 * The decimal string for an amount, without symbols or separators, suitable
 * for prefilling an input: toDecimalString(1250, "usd") === "12.50",
 * toDecimalString(1250, "jpy") === "1250".
 */
export function toDecimalString(amount, currency) {
  return (amount / 10 ** currencyExponent(currency)).toFixed(currencyExponent(currency));
}

/**
 * Parses what a user typed into an integer amount in minor units, or returns
 * null if it isn't a valid amount for that currency.
 *
 *   parseAmount("12.5", "usd")   === 1250
 *   parseAmount(" 12.50 ", "usd") === 1250
 *   parseAmount("12.505", "usd") === null   (too many decimals)
 *   parseAmount("1250", "jpy")   === 1250
 *   parseAmount("12.5", "jpy")   === null   (JPY has no decimals)
 *   parseAmount("-5", "usd")     === null
 *   parseAmount("1,000", "usd")  === null   (no thousands separators)
 *   parseAmount("", "usd")       === null
 */
export function parseAmount(input, currency) {
  const exponent = currencyExponent(currency);
  const text = String(input ?? "").trim();
  const pattern = exponent === 0 ? /^\d+$/ : new RegExp(`^\\d+(\\.\\d{1,${exponent}})?$`);
  if (!pattern.test(text)) return null;
  const [whole, fraction = ""] = text.split(".");
  return Number(whole + fraction.padEnd(exponent, "0"));
}
