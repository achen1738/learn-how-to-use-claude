import { multiply, subtract } from "./money.js";

// Sales tax / VAT rates by region code. A real system would fetch these from a
// tax provider; a static table is enough for this engine.
const TAX_RATES = {
  "US-CA": 0.0725,
  "US-NY": 0.08875,
  "US-TX": 0.0625,
  "US-OR": 0,
  GB: 0.2,
  DE: 0.19,
  FR: 0.2,
  JP: 0.1,
  KW: 0,
};

export class UnknownTaxRegionError extends Error {
  constructor(region) {
    super(`No tax rate configured for region ${JSON.stringify(region)}`);
    this.name = "UnknownTaxRegionError";
  }
}

export function taxRateFor(region) {
  if (!Object.hasOwn(TAX_RATES, region)) throw new UnknownTaxRegionError(region);
  return TAX_RATES[region];
}

/**
 * Tax owed on `taxable` for a customer in `region`.
 *
 * - "exclusive": prices are pre-tax, so tax is added on top.
 * - "inclusive": prices already contain tax, so the tax is the portion of the
 *   price above its net value: price - price / (1 + rate).
 */
export function computeTax(taxable, region, behavior = "exclusive") {
  const rate = taxRateFor(region);
  switch (behavior) {
    case "exclusive":
      return multiply(taxable, rate);
    case "inclusive":
      return subtract(taxable, multiply(taxable, 1 / (1 + rate)));
    default:
      throw new RangeError(`Unknown tax behavior: ${behavior}`);
  }
}
