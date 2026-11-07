// Existing tests: these pass before you start and must still pass when you finish.
// They also show how to drive the fake API from a test.
import { beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import { ApiError, configureApi, createRefund, failNextRefund, getPayment, listPayments, listRefunds, resetApi } from "../lib/api.js";

beforeEach(() => {
  resetApi();
  configureApi({ latencyMs: [0, 0] });
});

test("listPayments pages through results newest first", async () => {
  const first = await listPayments({ limit: 25 });
  const second = await listPayments({ limit: 25, cursor: first.nextCursor });
  const third = await listPayments({ limit: 25, cursor: second.nextCursor });

  assert.equal(first.data.length, 25);
  assert.equal(third.data.length, 10);
  assert.equal(third.nextCursor, null);
  assert.ok(first.data[0].created > first.data[24].created);
  assert.equal(new Set([...first.data, ...second.data, ...third.data].map((p) => p.id)).size, 60);
});

test("listPayments filters by status", async () => {
  const { data } = await listPayments({ status: "failed", limit: 100 });
  assert.ok(data.length > 0);
  assert.ok(data.every((p) => p.status === "failed"));
});

test("createRefund updates the payment on the server", async () => {
  const { data } = await listPayments({ status: "succeeded", limit: 1 });
  const payment = data[0];

  const refund = await createRefund(
    { paymentId: payment.id, amount: payment.amount, reason: "duplicate" },
    { idempotencyKey: "test-key-1" },
  );

  assert.equal(refund.amount, payment.amount);
  const after = await getPayment(payment.id);
  assert.equal(after.status, "refunded");
  assert.equal(after.amountRefunded, payment.amount);
  assert.equal((await listRefunds(payment.id)).length, 1);
});

test("the same idempotency key never refunds twice", async () => {
  const { data } = await listPayments({ status: "succeeded", limit: 1 });
  const params = { paymentId: data[0].id, amount: 100, reason: "requested_by_customer" };

  const first = await createRefund(params, { idempotencyKey: "k" });
  const second = await createRefund(params, { idempotencyKey: "k" });

  assert.equal(first.id, second.id);
  assert.equal((await listRefunds(data[0].id)).length, 1);
});

test("a lost response still refunded on the server", async () => {
  const { data } = await listPayments({ status: "succeeded", limit: 1 });
  failNextRefund("response_lost");

  await assert.rejects(
    createRefund({ paymentId: data[0].id, amount: 100, reason: "duplicate" }, { idempotencyKey: "k2" }),
    (error) => error instanceof ApiError && error.code === "network_error" && error.retryable,
  );
  assert.equal((await listRefunds(data[0].id)).length, 1);
});
