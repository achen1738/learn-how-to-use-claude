// Spec tests for Part 1. These fail until you implement features/refundLogic.js.
import { test } from "node:test";
import assert from "node:assert/strict";
import { applyRefund, refundableAmount, validateRefund } from "../features/refundLogic.js";

const payment = (overrides = {}) =>
  Object.freeze({
    id: "py_test",
    amount: 5000,
    amountRefunded: 1000,
    currency: "usd",
    status: "partially_refunded",
    customer: { name: "Test", email: "test@example.com" },
    description: "Test",
    created: "2026-09-01T00:00:00.000Z",
    ...overrides,
  });

test("refundableAmount is what's left for refundable payments", () => {
  assert.equal(refundableAmount(payment()), 4000);
  assert.equal(refundableAmount(payment({ status: "succeeded", amountRefunded: 0 })), 5000);
});

test("refundableAmount is 0 for payments that can't be refunded", () => {
  for (const status of ["refunded", "failed", "disputed"]) {
    assert.equal(refundableAmount(payment({ status })), 0, status);
  }
});

test("validateRefund accepts a valid refund and converts the amount", () => {
  assert.deepEqual(validateRefund(payment(), { amountInput: "25.50", reason: "duplicate" }), {
    value: { amount: 2550, reason: "duplicate" },
  });
  assert.deepEqual(
    validateRefund(payment({ currency: "jpy", amount: 3000, amountRefunded: 0, status: "succeeded" }), {
      amountInput: "3000",
      reason: "fraudulent",
    }),
    { value: { amount: 3000, reason: "fraudulent" } },
  );
});

test("validateRefund reports field errors", () => {
  const p = payment();
  assert.deepEqual(validateRefund(p, { amountInput: "abc", reason: "duplicate" }), {
    errors: { amount: "Enter a valid amount" },
  });
  assert.deepEqual(validateRefund(p, { amountInput: "0", reason: "duplicate" }), {
    errors: { amount: "Amount must be greater than zero" },
  });
  assert.deepEqual(validateRefund(p, { amountInput: "40.01", reason: "duplicate" }), {
    errors: { amount: "You can refund at most $40.00" },
  });
  assert.deepEqual(validateRefund(p, { amountInput: "10", reason: "" }), {
    errors: { reason: "Choose a reason" },
  });
  assert.deepEqual(validateRefund(p, { amountInput: "", reason: "" }), {
    errors: { amount: "Enter a valid amount", reason: "Choose a reason" },
  });
});

test("validateRefund rejects payments that can't be refunded", () => {
  assert.deepEqual(validateRefund(payment({ status: "failed" }), { amountInput: "1", reason: "duplicate" }), {
    errors: { form: "This payment can't be refunded" },
  });
});

test("applyRefund returns an updated copy without modifying the payment", () => {
  const original = payment();
  const partial = applyRefund(original, { id: "re_1", paymentId: "py_test", amount: 1500, reason: "duplicate" });
  assert.equal(partial.amountRefunded, 2500);
  assert.equal(partial.status, "partially_refunded");
  assert.equal(original.amountRefunded, 1000);

  const full = applyRefund(partial, { id: "re_2", paymentId: "py_test", amount: 2500, reason: "duplicate" });
  assert.equal(full.amountRefunded, 5000);
  assert.equal(full.status, "refunded");
});
