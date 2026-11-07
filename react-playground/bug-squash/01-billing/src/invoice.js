import { applyCoupon } from "./discounts.js";
import { getCurrency } from "./currencies.js";
import { add, fromDecimal, money, multiply, subtract, sum } from "./money.js";
import { computeTax } from "./tax.js";

// Builds an invoice from a customer, a list of items and an optional coupon.
//
// Items come in one of two shapes:
//
//   { productId, description, unitPrice: 12.5, quantity: 3 }   decimal price
//   { productId, description, amount: Money }                  precomputed, e.g. from proration
//
// Money flows through four steps, each producing integer minor units:
//
//   items -> lines (amount) -> discounts (per line) -> tax (per line) -> totals

let nextInvoiceNumber = 1;

function toLine(item, currency) {
  if (item.amount) {
    if (item.amount.currency !== currency) {
      throw new RangeError(
        `Item ${item.productId} is in ${item.amount.currency}, invoice is in ${currency}`,
      );
    }
    return {
      productId: item.productId,
      description: item.description,
      quantity: 1,
      amount: item.amount,
    };
  }

  if (!Number.isInteger(item.quantity) || item.quantity < 1) {
    throw new RangeError(`Item ${item.productId} quantity must be a positive integer`);
  }
  const unitAmount = fromDecimal(item.unitPrice, currency);
  return {
    productId: item.productId,
    description: item.description,
    quantity: item.quantity,
    unitAmount,
    amount: multiply(unitAmount, item.quantity),
  };
}

/**
 * @param {object} input
 * @param {string} input.currency
 * @param {{id: string, taxRegion: string}} input.customer
 * @param {object[]} input.items
 * @param {object|null} [input.coupon]
 * @param {"exclusive"|"inclusive"} [input.taxBehavior]
 */
export function buildInvoice({
  currency,
  customer,
  items,
  coupon = null,
  taxBehavior = "exclusive",
}) {
  const code = getCurrency(currency).code;
  if (items.length === 0) throw new RangeError("An invoice needs at least one item");

  const lines = applyCoupon(
    items.map((item) => toLine(item, code)),
    coupon,
    code,
  ).map((line) => {
    const taxable = subtract(line.amount, line.discount);
    return { ...line, tax: computeTax(taxable, customer.taxRegion, taxBehavior) };
  });

  const subtotal = sum(
    lines.map((l) => l.amount),
    code,
  );
  const discount = sum(
    lines.map((l) => l.discount),
    code,
  );
  const tax = sum(
    lines.map((l) => l.tax),
    code,
  );
  const afterDiscount = subtract(subtotal, discount);
  const total = taxBehavior === "exclusive" ? add(afterDiscount, tax) : afterDiscount;

  return {
    number: `INV-${String(nextInvoiceNumber++).padStart(5, "0")}`,
    customer: customer.id,
    currency: code,
    couponId: coupon?.id ?? null,
    taxBehavior,
    lines,
    subtotal,
    discount,
    tax,
    total,
    amountDue: total.amount > 0 ? total : money(0, code),
  };
}
