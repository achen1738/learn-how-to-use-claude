import { test } from "node:test";
import assert from "node:assert/strict";
import { formatMoney, formatRate, money } from "../src/index.js";

test("formats two-decimal currencies", () => {
  assert.equal(formatMoney(money(1999, "USD")), "$19.99");
  assert.equal(formatMoney(money(-450, "GBP")), "-£4.50");
});

test("formats zero-decimal currencies without decimals", () => {
  assert.equal(formatMoney(money(1100, "JPY")), "¥1,100");
});

test("formats tax rates", () => {
  assert.equal(formatRate(0.0725), "7.25%");
  assert.equal(formatRate(0.2), "20%");
});
