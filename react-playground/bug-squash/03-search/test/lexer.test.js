import { test } from "node:test";
import assert from "node:assert/strict";
import { QueryError, tokenize } from "../src/index.js";

const kinds = (query) => tokenize(query).map((t) => (t.value == null ? t.type : `${t.type}(${t.value})`));

test("field comparisons", () => {
  assert.deepEqual(kinds("status:active"), ["FIELD(status)", "OP(:)", "WORD(active)", "EOF"]);
  assert.deepEqual(kinds("amount>100"), ["FIELD(amount)", "OP(>)", "WORD(100)", "EOF"]);
  assert.deepEqual(kinds("plan!=free"), ["FIELD(plan)", "OP(!=)", "WORD(free)", "EOF"]);
});

test("free text, quoted strings and keywords", () => {
  assert.deepEqual(kinds('grace OR "Ada Lovelace"'), ["WORD(grace)", "OR(OR)", "STRING(Ada Lovelace)", "EOF"]);
  assert.deepEqual(kinds('name:"Tim Berners-Lee"'), ["FIELD(name)", "OP(:)", "STRING(Tim Berners-Lee)", "EOF"]);
});

test("a leading dash is negation, a dash inside a value is not", () => {
  assert.deepEqual(kinds("-country:US created>2026-01-01"), [
    "NOT(-)",
    "FIELD(country)",
    "OP(:)",
    "WORD(US)",
    "FIELD(created)",
    "OP(>)",
    "WORD(2026-01-01)",
    "EOF",
  ]);
});

test("keywords after an operator are values", () => {
  assert.deepEqual(kinds("country:OR"), ["FIELD(country)", "OP(:)", "WORD(OR)", "EOF"]);
});

test("token positions point into the query", () => {
  const tokens = tokenize("  plan:pro  (a)");
  assert.deepEqual(
    tokens.map((t) => t.pos),
    [2, 6, 7, 12, 13, 14, 15],
  );
});

test("lexing errors carry a position", () => {
  assert.throws(
    () => tokenize('name:"unterminated'),
    (error) => error instanceof QueryError && error.position === 5,
  );
  assert.throws(
    () => tokenize("plan: pro"),
    (error) => error instanceof QueryError && /Expected a value/.test(error.message),
  );
});
