// Turns a finished invoice into the request body for the payment processor.
//
// The processor's API takes `amount` as an integer in the currency's smallest
// unit (cents for USD, yen for JPY) and `currency` as a lowercase ISO code.

export class NothingToChargeError extends Error {
  constructor(invoiceNumber) {
    super(`Invoice ${invoiceNumber} has nothing to charge`);
    this.name = "NothingToChargeError";
  }
}

export function toChargeRequest(invoice, { idempotencyPrefix = "inv" } = {}) {
  if (invoice.amountDue.amount <= 0) throw new NothingToChargeError(invoice.number);

  return {
    amount: invoice.amountDue.amount,
    currency: invoice.currency.toLowerCase(),
    customer: invoice.customer,
    description: `Invoice ${invoice.number}`,
    metadata: {
      invoice_number: invoice.number,
      line_count: String(invoice.lines.length),
      coupon: invoice.couponId ?? "",
    },
    idempotencyKey: `${idempotencyPrefix}_${invoice.number}`,
  };
}
