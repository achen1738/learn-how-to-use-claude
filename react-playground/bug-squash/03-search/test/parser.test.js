import { test } from "node:test";
import assert from "node:assert/strict";
import { parse, printAst, QueryError } from "../src/index.js";

const tree = (query) => printAst(parse(query));

test("an empty query matches everything", () => {
  assert.equal(tree(""), "(all)");
  assert.equal(tree("   "), "(all)");
});

test("terms side by side are ANDed", () => {
  assert.equal(tree("plan:pro country:GB"), '(and (plan : "pro") (country : "GB"))');
  assert.equal(tree("plan:pro AND country:GB"), '(and (plan : "pro") (country : "GB"))');
});

test("AND binds tighter than OR", () => {
  assert.equal(tree("a:1 OR b:2 c:3"), '(or (a : "1") (and (b : "2") (c : "3")))');
  assert.equal(tree("a:1 b:2 OR c:3"), '(or (and (a : "1") (b : "2")) (c : "3"))');
});

test("parentheses group", () => {
  assert.equal(tree("(a:1 OR b:2) c:3"), '(and (or (a : "1") (b : "2")) (c : "3"))');
});

test("negating a single term", () => {
  assert.equal(tree("NOT status:canceled"), '(not (status : "canceled"))');
  assert.equal(tree("-status:canceled"), '(not (status : "canceled"))');
  assert.equal(tree("-(a:1 OR b:2)"), '(not (or (a : "1") (b : "2")))');
});

test("free text terms", () => {
  assert.equal(tree('grace "Ada Lovelace"'), '(and (text "grace") (text "Ada Lovelace"))');
});

test("syntax errors", () => {
  assert.throws(() => parse("(plan:pro"), (e) => e instanceof QueryError && /Expected "\)"/.test(e.message));
  assert.throws(() => parse("plan:pro)"), (e) => e instanceof QueryError && e.position === 8);
  assert.throws(() => parse("plan:pro OR"), (e) => e instanceof QueryError && /end of the query/.test(e.message));
  assert.throws(() => parse("()"), /Empty parentheses/);
});
