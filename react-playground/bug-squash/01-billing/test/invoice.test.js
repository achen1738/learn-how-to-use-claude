import { test } from "node:test";
import assert from "node:assert/strict";
import { buildInvoice, formatMoney, InvalidCouponError, toChargeRequest } from "../src/index.js";

const californian = { id: "cus_ca", taxRegion: "US-CA" };
const oregonian = { id: "cus_or", taxRegion: "US-OR" };
const tokyo = { id: "cus_jp", taxRegion: "JP" };
const berlin = { id: "cus_de", taxRegion: "DE" };

const amounts = (invoice) => ({
  subtotal: invoice.subtotal.amount,
  discount: invoice.discount.amount,
  tax: invoice.tax.amount,
  total: invoice.total.amount,
});

test("USD invoice with a product-restricted percentage coupon and sales tax", () => {
  const invoice = buildInvoice({
    currency: "USD",
    customer: californian,
    items: [
      { productId: "prod_pro", description: "Pro plan", unitPrice: 49, quantity: 1 },
      { productId: "prod_seat", description: "Extra seats", unitPrice: 12.5, quantity: 3 },
    ],
    coupon: { id: "SEATS20", percentOff: 20, appliesTo: ["prod_seat"] },
  });

  assert.deepEqual(
    invoice.lines.map((l) => [l.productId, l.amount.amount, l.discount.amount, l.tax.amount]),
    [
      ["prod_pro", 4900, 0, 355],
      ["prod_seat", 3750, 750, 218],
    ],
  );
  assert.deepEqual(amounts(invoice), { subtotal: 8650, discount: 750, tax: 573, total: 8473 });
  assert.equal(formatMoney(invoice.total), "$84.73");
});

test("fixed-amount coupons are spread across lines by amount", () => {
  const invoice = buildInvoice({
    currency: "USD",
    customer: oregonian,
    items: [
      { productId: "prod_a", description: "A", unitPrice: 30, quantity: 1 },
      { productId: "prod_b", description: "B", unitPrice: 15, quantity: 1 },
    ],
    coupon: { id: "TENOFF", amountOff: { amount: 1000, currency: "USD" } },
  });

  assert.deepEqual(
    invoice.lines.map((l) => l.discount.amount),
    [667, 333],
  );
  assert.deepEqual(amounts(invoice), { subtotal: 4500, discount: 1000, tax: 0, total: 3500 });
});

test("a fixed-amount coupon never discounts below zero", () => {
  const invoice = buildInvoice({
    currency: "USD",
    customer: oregonian,
    items: [{ productId: "prod_a", description: "A", unitPrice: 5, quantity: 1 }],
    coupon: { id: "TENOFF", amountOff: { amount: 1000, currency: "USD" } },
  });
  assert.equal(invoice.total.amount, 0);
  assert.equal(invoice.amountDue.amount, 0);
});

test("tax-inclusive prices in EUR", () => {
  const invoice = buildInvoice({
    currency: "EUR",
    customer: berlin,
    taxBehavior: "inclusive",
    items: [{ productId: "prod_pro", description: "Pro plan", unitPrice: 119, quantity: 1 }],
  });
  assert.deepEqual(amounts(invoice), { subtotal: 11900, discount: 0, tax: 1900, total: 11900 });
});

test("invalid coupons are rejected", () => {
  assert.throws(
    () =>
      buildInvoice({
        currency: "USD",
        customer: oregonian,
        items: [{ productId: "prod_a", description: "A", unitPrice: 5, quantity: 1 }],
        coupon: { id: "BROKEN", percentOff: 150 },
      }),
    InvalidCouponError,
  );
});

test("JPY invoice is computed in whole yen", () => {
  const invoice = buildInvoice({
    currency: "JPY",
    customer: tokyo,
    items: [{ productId: "prod_team", description: "Team plan", unitPrice: 1000, quantity: 1 }],
  });

  assert.deepEqual(amounts(invoice), { subtotal: 1000, discount: 0, tax: 100, total: 1100 });
  assert.equal(formatMoney(invoice.total), "¥1,100");
});

test("charge request sends the amount in the currency's smallest unit", () => {
  const usd = buildInvoice({
    currency: "USD",
    customer: oregonian,
    items: [{ productId: "prod_a", description: "A", unitPrice: 19.99, quantity: 2 }],
  });
  assert.equal(toChargeRequest(usd).amount, 3998);
  assert.equal(toChargeRequest(usd).currency, "usd");

  const jpy = buildInvoice({
    currency: "JPY",
    customer: tokyo,
    items: [{ productId: "prod_team", description: "Team plan", unitPrice: 4980, quantity: 1 }],
  });
  const request = toChargeRequest(jpy);
  assert.equal(request.currency, "jpy");
  assert.equal(request.amount, 5478);
});
