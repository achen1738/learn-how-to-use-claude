import { test } from "node:test";
import assert from "node:assert/strict";
import { signPayload, SignatureVerificationError, verifySignature } from "../src/index.js";

const secret = "whsec_test_123";
const body = JSON.stringify({ id: "evt_1", type: "invoice.paid" });
const now = Date.UTC(2026, 0, 1);

test("a freshly signed payload verifies", () => {
  const header = signPayload(body, secret, now);
  assert.match(header, /^t=\d+,v1=[0-9a-f]{64}$/);
  assert.equal(verifySignature(body, header, secret, { nowMs: now + 5_000 }), true);
});

test("a tampered body is rejected", () => {
  const header = signPayload(body, secret, now);
  assert.throws(() => verifySignature(body.replace("paid", "void"), header, secret, { nowMs: now }), SignatureVerificationError);
});

test("an old signature is rejected as a possible replay", () => {
  const header = signPayload(body, secret, now);
  assert.throws(
    () => verifySignature(body, header, secret, { nowMs: now + 301_000 }),
    (error) => error instanceof SignatureVerificationError && /tolerance/.test(error.message),
  );
});

test("any one of several signatures may match (secret rotation)", () => {
  const header = signPayload(body, secret, now);
  const withOldSecret = signPayload(body, "whsec_old", now).split(",")[1];
  assert.equal(verifySignature(body, `${header},${withOldSecret}`, secret, { nowMs: now }), true);
});
