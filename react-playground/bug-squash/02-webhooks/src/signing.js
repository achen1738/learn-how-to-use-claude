import { createHmac, timingSafeEqual } from "node:crypto";

// Every delivery carries a signature header so the receiver can check that the
// payload came from us and wasn't replayed:
//
//   Webhook-Signature: t=1767225600,v1=<64 hex chars>
//
// `t` is the Unix timestamp (seconds) at signing time and `v1` is
// HMAC-SHA256(secret, `${t}.${body}`) in hex.

export const SIGNATURE_HEADER = "Webhook-Signature";
export const DEFAULT_TOLERANCE_SECONDS = 300;

export class SignatureVerificationError extends Error {
  constructor(reason) {
    super(`Webhook signature verification failed: ${reason}`);
    this.name = "SignatureVerificationError";
    this.reason = reason;
  }
}

function hmac(secret, timestampSeconds, body) {
  return createHmac("sha256", secret).update(`${timestampSeconds}.${body}`).digest("hex");
}

/** @param {number} nowMs Signing time in milliseconds. */
export function signPayload(body, secret, nowMs) {
  const t = Math.floor(nowMs / 1000);
  return `t=${t},v1=${hmac(secret, t, body)}`;
}

export function parseSignatureHeader(header) {
  const parts = Object.create(null);
  for (const piece of String(header).split(",")) {
    const [key, ...rest] = piece.split("=");
    const value = rest.join("=");
    if (key && value) (parts[key.trim()] ??= []).push(value.trim());
  }
  const t = Number(parts.t?.[0]);
  if (!Number.isInteger(t)) throw new SignatureVerificationError("missing or malformed timestamp");
  if (!parts.v1?.length) throw new SignatureVerificationError("no v1 signature");
  return { t, signatures: parts.v1 };
}

/**
 * Throws SignatureVerificationError unless `header` is a valid, fresh signature
 * of `body`. A header may carry several v1 signatures during secret rotation;
 * any one matching is enough.
 */
export function verifySignature(body, header, secret, { nowMs, toleranceSeconds = DEFAULT_TOLERANCE_SECONDS }) {
  const { t, signatures } = parseSignatureHeader(header);
  if (Math.abs(Math.floor(nowMs / 1000) - t) > toleranceSeconds) {
    throw new SignatureVerificationError("timestamp outside the tolerance window");
  }
  const expected = Buffer.from(hmac(secret, t, body), "hex");
  const matches = signatures.some((candidate) => {
    const actual = Buffer.from(candidate, "hex");
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  });
  if (!matches) throw new SignatureVerificationError("no signature matches the payload");
  return true;
}
