import { test } from "node:test";
import assert from "node:assert/strict";
import { buildInvoice, prorationItems } from "../src/index.js";

const april = { start: "2026-04-01", end: "2026-05-01" }; // 30 days
const pro = { productId: "prod_pro", name: "Pro", price: 20 };
const business = { productId: "prod_business", name: "Business", price: 50 };

const lineAmounts = (items) => items.map((item) => item.amount.amount);

test("upgrading halfway through the period credits half and charges half", () => {
  const items = prorationItems({ currency: "USD", period: april, changeDate: "2026-04-16", from: pro, to: business });

  assert.deepEqual(
    items.map((i) => i.description),
    ["Unused time on Pro", "Remaining time on Business"],
  );
  assert.deepEqual(lineAmounts(items), [-1000, 2500]);
});

test("changing plan on the first day of the period swaps the full price", () => {
  const items = prorationItems({ currency: "USD", period: april, changeDate: "2026-04-01", from: pro, to: business });
  assert.deepEqual(lineAmounts(items), [-2000, 5000]);
});

test("changing plan on the last day of the period prorates a single day", () => {
  const items = prorationItems({ currency: "USD", period: april, changeDate: "2026-04-30", from: pro, to: business });
  assert.deepEqual(lineAmounts(items), [-67, 167]);
});

test("switching to a plan with the same price nets to zero", () => {
  const items = prorationItems({
    currency: "USD",
    period: april,
    changeDate: "2026-04-10",
    from: pro,
    to: { ...pro, productId: "prod_pro_v2", name: "Pro (2026)" },
  });
  assert.equal(items[0].amount.amount + items[1].amount.amount, 0);
});

test("change dates outside the period are rejected", () => {
  assert.throws(
    () => prorationItems({ currency: "USD", period: april, changeDate: "2026-05-01", from: pro, to: business }),
    RangeError,
  );
});

test("proration items can be invoiced", () => {
  const invoice = buildInvoice({
    currency: "USD",
    customer: { id: "cus_or", taxRegion: "US-OR" },
    items: prorationItems({ currency: "USD", period: april, changeDate: "2026-04-16", from: pro, to: business }),
  });
  assert.equal(invoice.total.amount, 1500);
});
