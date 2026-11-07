import { test } from "node:test";
import assert from "node:assert/strict";
import { compileQuery, QueryError } from "../src/index.js";

const rejects = (query, pattern) =>
  assert.throws(
    () => compileQuery(query),
    (error) => error instanceof QueryError && pattern.test(error.message),
  );

test("unknown fields suggest the closest match", () => {
  rejects("staus:active", /Unknown field "staus"\. Did you mean "status"\?/);
  rejects("zzz:1", /^Unknown field "zzz"\.$/);
});

test("values are validated against the field type", () => {
  rejects("amount:lots", /Expected a number for amount, got "lots"/);
  rejects("status:paused", /Unknown status "paused"/);
  rejects("created>yesterday", /Expected a date/);
  rejects("delinquent:maybe", /Expected true or false/);
});

test("ordering operators are only allowed on ordered types", () => {
  rejects("name>m", /Operator ">" isn't supported for string field "name"/);
  rejects("delinquent<true", /isn't supported/);
});

test("aliases resolve to the same field", () => {
  const record = { subscription: { amount: 50 } };
  assert.equal(compileQuery("mrr>10")(record), true);
  assert.equal(compileQuery("amount>10")(record), true);
});

test("multi-value fields match if any element matches", () => {
  const record = { tags: ["vip", "beta"] };
  assert.equal(compileQuery("tag:beta")(record), true);
  assert.equal(compileQuery("tag:churn-risk")(record), false);
  assert.equal(compileQuery("tag!=churn-risk")(record), true);
});
