import { test } from "node:test";
import assert from "node:assert/strict";
import {
  add,
  allocate,
  CurrencyMismatchError,
  fromDecimal,
  money,
  multiply,
  sum,
  toDecimal,
  UnsupportedCurrencyError,
} from "../src/index.js";

test("fromDecimal converts to integer minor units without float drift", () => {
  assert.deepEqual(fromDecimal(19.99, "USD"), { amount: 1999, currency: "USD" });
  assert.deepEqual(fromDecimal(0.1 + 0.2, "EUR"), { amount: 30, currency: "EUR" });
  assert.deepEqual(fromDecimal(-4.5, "GBP"), { amount: -450, currency: "GBP" });
});

test("fromDecimal respects three-decimal currencies", () => {
  assert.deepEqual(fromDecimal(1.234, "KWD"), { amount: 1234, currency: "KWD" });
});

test("toDecimal is the inverse of fromDecimal", () => {
  for (const [value, currency] of [
    [19.99, "USD"],
    [1.234, "KWD"],
    [-7.5, "EUR"],
  ]) {
    assert.equal(toDecimal(fromDecimal(value, currency)), value);
  }
});

test("currency codes are normalised and unknown ones are rejected", () => {
  assert.equal(money(100, " usd ").currency, "USD");
  assert.throws(() => money(100, "XYZ"), UnsupportedCurrencyError);
});

test("amounts must be integers", () => {
  assert.throws(() => money(10.5, "USD"), TypeError);
});

test("add and sum refuse to mix currencies", () => {
  assert.throws(() => add(money(1, "USD"), money(1, "EUR")), CurrencyMismatchError);
  assert.deepEqual(sum([money(1, "USD"), money(2, "USD")], "USD"), money(3, "USD"));
});

test("multiply rounds half away from zero", () => {
  assert.equal(multiply(money(1005, "USD"), 0.1).amount, 101);
  assert.equal(multiply(money(-1005, "USD"), 0.1).amount, -101);
  assert.equal(multiply(money(3000, "USD"), 0.0725).amount, 218);
});

test("allocate always adds up to the total", () => {
  const shares = allocate(money(1000, "USD"), [1, 1, 1]);
  assert.deepEqual(
    shares.map((s) => s.amount),
    [334, 333, 333],
  );

  const negative = allocate(money(-100, "USD"), [1, 1, 1]);
  assert.equal(
    negative.reduce((acc, s) => acc + s.amount, 0),
    -100,
  );
});

test("allocate gives leftovers to the largest remainders", () => {
  const shares = allocate(money(1000, "USD"), [3000, 1500]);
  assert.deepEqual(
    shares.map((s) => s.amount),
    [667, 333],
  );
});
