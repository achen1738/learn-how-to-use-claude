// Existing tests: these pass before you start and must still pass when you finish.
import { test } from "node:test";
import assert from "node:assert/strict";
import { formatMoney, parseAmount, toDecimalString } from "../lib/money.js";

test("formatMoney respects each currency's decimals", () => {
  assert.equal(formatMoney(1250, "usd"), "$12.50");
  assert.equal(formatMoney(1250, "jpy"), "¥1,250");
  assert.equal(formatMoney(99, "eur"), "€0.99");
});

test("toDecimalString gives a plain number for inputs", () => {
  assert.equal(toDecimalString(1250, "usd"), "12.50");
  assert.equal(toDecimalString(1250, "jpy"), "1250");
});

test("parseAmount accepts valid amounts", () => {
  assert.equal(parseAmount("12.5", "usd"), 1250);
  assert.equal(parseAmount(" 12.50 ", "usd"), 1250);
  assert.equal(parseAmount("0.01", "usd"), 1);
  assert.equal(parseAmount("1250", "jpy"), 1250);
});

test("parseAmount rejects invalid amounts", () => {
  for (const [input, currency] of [
    ["12.505", "usd"],
    ["12.5", "jpy"],
    ["-5", "usd"],
    ["1,000", "usd"],
    ["", "usd"],
    ["abc", "usd"],
  ]) {
    assert.equal(parseAmount(input, currency), null, `${input} ${currency}`);
  }
});
