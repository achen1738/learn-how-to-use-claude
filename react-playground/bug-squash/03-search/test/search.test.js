import { test } from "node:test";
import assert from "node:assert/strict";
import { customers } from "../fixtures/customers.js";
import { search } from "../src/index.js";

const ids = (query, options) => search(customers, query, options).map((c) => c.id);

test("filters by an enum field", () => {
  assert.deepEqual(ids("plan:pro"), [
    "cus_001",
    "cus_003",
    "cus_006",
    "cus_008",
    "cus_009",
    "cus_014",
  ]);
});

test("free text searches names and emails", () => {
  assert.deepEqual(ids("lovelace"), ["cus_001"]);
  assert.deepEqual(ids('"Grace Hopper"'), ["cus_002"]);
  assert.deepEqual(ids("email:*@nasa.gov"), ["cus_004"]);
});

test("OR across countries", () => {
  assert.deepEqual(ids("country:GB OR country:FI"), [
    "cus_001",
    "cus_003",
    "cus_005",
    "cus_009",
    "cus_016",
  ]);
});

test("grouping with parentheses", () => {
  assert.deepEqual(ids("(plan:pro OR plan:enterprise) delinquent:true"), ["cus_009", "cus_015"]);
});

test("tags and dates", () => {
  assert.deepEqual(ids("tag:vip created<2025-01-01"), ["cus_002", "cus_011"]);
});

test("inclusive numeric bounds", () => {
  assert.deepEqual(ids("status:active amount>=149"), ["cus_002", "cus_008", "cus_011"]);
  assert.deepEqual(ids("status:trialing mrr<=29"), ["cus_012"]);
});

test("excluding canceled customers from a plan", () => {
  assert.deepEqual(ids("-status:canceled plan:pro"), [
    "cus_001",
    "cus_006",
    "cus_008",
    "cus_009",
    "cus_014",
  ]);
  assert.deepEqual(ids("plan:pro -status:canceled"), [
    "cus_001",
    "cus_006",
    "cus_008",
    "cus_009",
    "cus_014",
  ]);
});

test("sorting everyone by signup date, newest first", () => {
  assert.deepEqual(ids("", { sort: "-created", limit: 3 }), ["cus_012", "cus_006", "cus_010"]);
});

test("sorting by several keys", () => {
  assert.deepEqual(ids("plan:enterprise", { sort: "-amount,name" }), [
    "cus_015",
    "cus_002",
    "cus_011",
    "cus_013",
  ]);
});

test("limit keeps the first matches in their original order", () => {
  assert.deepEqual(ids("status:active", { limit: 3 }), ["cus_001", "cus_002", "cus_005"]);
});

test("an empty query returns every customer", () => {
  assert.equal(ids("").length, customers.length);
  assert.equal(ids("")[0], "cus_001");
});
