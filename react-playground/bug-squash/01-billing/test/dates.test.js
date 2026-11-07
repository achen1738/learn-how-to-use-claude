import { test } from "node:test";
import assert from "node:assert/strict";
import { addMonths, daysBetween, daysInPeriod, isWithinPeriod, parseDate, periodStartingOn, toISODate } from "../src/index.js";

test("parseDate accepts ISO dates and rejects impossible ones", () => {
  assert.equal(parseDate("2026-04-01").toISOString(), "2026-04-01T00:00:00.000Z");
  assert.throws(() => parseDate("2026-02-30"), RangeError);
  assert.throws(() => parseDate("04/01/2026"), TypeError);
});

test("daysBetween counts whole days", () => {
  assert.equal(daysBetween("2026-04-01", "2026-04-02"), 1);
  assert.equal(daysBetween("2026-04-01", "2026-05-01"), 30);
  assert.equal(daysBetween("2026-03-01", "2026-04-01"), 31);
});

test("addMonths clamps to the end of shorter months", () => {
  assert.equal(toISODate(addMonths("2026-01-31", 1)), "2026-02-28");
  assert.equal(toISODate(addMonths("2028-01-31", 1)), "2028-02-29");
  assert.equal(toISODate(addMonths("2026-11-15", 3)), "2027-02-15");
});

test("monthly periods are half-open", () => {
  const april = periodStartingOn("2026-04-01");
  assert.equal(toISODate(april.end), "2026-05-01");
  assert.equal(daysInPeriod(april), 30);
  assert.equal(isWithinPeriod(april, "2026-04-01"), true);
  assert.equal(isWithinPeriod(april, "2026-04-30"), true);
  assert.equal(isWithinPeriod(april, "2026-05-01"), false);
});
