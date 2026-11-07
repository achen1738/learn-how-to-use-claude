// A fake payments API that runs in memory, with realistic latency and errors.
// Treat it like a real remote API: you can't change it, and it's documented
// in DOCS.md.

export const PAYMENT_STATUSES = [
  "succeeded",
  "partially_refunded",
  "refunded",
  "failed",
  "disputed",
];
export const REFUND_REASONS = ["requested_by_customer", "duplicate", "fraudulent"];

export class ApiError extends Error {
  constructor(code, message, { status, retryable = false } = {}) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.retryable = retryable;
  }
}

// ---------------------------------------------------------------------------
// Seed data (deterministic, so tests and the UI always see the same payments)

const CUSTOMERS = [
  ["Ada Lovelace", "ada@example.com"],
  ["Grace Hopper", "grace@example.com"],
  ["Alan Turing", "alan@example.com"],
  ["Katherine Johnson", "katherine@example.com"],
  ["Linus Torvalds", "linus@example.com"],
  ["Margaret Hamilton", "margaret@example.com"],
  ["Barbara Liskov", "barbara@example.com"],
  ["Hedy Lamarr", "hedy@example.com"],
];
const DESCRIPTIONS = [
  "Pro plan (monthly)",
  "Team plan (annual)",
  "Extra seats",
  "API credits",
  "Onboarding package",
];

function createSeed() {
  let state = 7;
  const random = () => (state = (state * 1_103_515_245 + 12_345) % 2 ** 31) / 2 ** 31;
  const pick = (list) => list[Math.floor(random() * list.length)];
  const start = Date.UTC(2026, 8, 1);

  return Array.from({ length: 60 }, (_, i) => {
    const currency = i % 9 === 4 ? "jpy" : i % 7 === 3 ? "eur" : "usd";
    const amount =
      currency === "jpy"
        ? 500 * (2 + Math.floor(random() * 40))
        : 500 + Math.floor(random() * 30_000);
    const roll = random();
    const status =
      roll < 0.55
        ? "succeeded"
        : roll < 0.7
          ? "partially_refunded"
          : roll < 0.8
            ? "refunded"
            : roll < 0.92
              ? "failed"
              : "disputed";
    const amountRefunded =
      status === "refunded"
        ? amount
        : status === "partially_refunded"
          ? Math.floor(amount * (0.2 + random() * 0.5))
          : 0;
    const [name, email] = pick(CUSTOMERS);

    return {
      id: `py_${String(i + 1).padStart(3, "0")}`,
      amount,
      amountRefunded,
      currency,
      status,
      customer: { name, email },
      description: pick(DESCRIPTIONS),
      created: new Date(start + i * 9 * 60 * 60 * 1000).toISOString(),
    };
  });
}

// ---------------------------------------------------------------------------
// Server state

const DEFAULT_CONFIG = { latencyMs: [300, 900] };

let config;
let payments;
let refunds;
let idempotency;
let injectedFailures;
let refundCounter;

/** Restores the initial data and settings. Tests call this before each test. */
export function resetApi() {
  config = { ...DEFAULT_CONFIG };
  payments = new Map(createSeed().map((p) => [p.id, p]));
  refunds = [];
  idempotency = new Map();
  injectedFailures = [];
  refundCounter = 0;
}
resetApi();

/** Change latency: configureApi({ latencyMs: [0, 0] }) makes every call instant. */
export function configureApi(options) {
  config = { ...config, ...options };
}

/**
 * Makes the NEXT createRefund call fail in a specific way (for tests and
 * manual testing). Call it several times to queue several failures.
 *
 *   "network"       the request never reaches the server
 *   "response_lost" the server PROCESSES the refund, but the response is lost
 *   "rate_limited"  the server rejects the request with 429
 */
export function failNextRefund(kind) {
  if (!["network", "response_lost", "rate_limited"].includes(kind))
    throw new Error(`Unknown failure: ${kind}`);
  injectedFailures.push(kind);
}

const copy = (value) => structuredClone(value);

function delay() {
  const [min, max] = config.latencyMs;
  const ms = min + Math.random() * (max - min);
  return ms > 0 ? new Promise((resolve) => setTimeout(resolve, ms)) : Promise.resolve();
}

// ---------------------------------------------------------------------------
// Endpoints

/**
 * Newest first. Returns { data, nextCursor }; pass nextCursor back as
 * `cursor` to get the next page. nextCursor is null on the last page.
 */
export async function listPayments({ status = "all", cursor = null, limit = 20 } = {}) {
  await delay();
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new ApiError("invalid_request", "limit must be an integer from 1 to 100", {
      status: 400,
    });
  }
  if (status !== "all" && !PAYMENT_STATUSES.includes(status)) {
    throw new ApiError("invalid_request", `Unknown status: ${status}`, { status: 400 });
  }

  const matching = [...payments.values()]
    .filter((p) => status === "all" || p.status === status)
    .sort((a, b) => b.created.localeCompare(a.created));
  const start = cursor ? matching.findIndex((p) => p.id === cursor) + 1 : 0;
  const data = matching.slice(start, start + limit);
  const nextCursor = start + limit < matching.length ? data[data.length - 1].id : null;
  return { data: copy(data), nextCursor };
}

export async function getPayment(id) {
  await delay();
  const payment = payments.get(id);
  if (!payment) throw new ApiError("not_found", `No payment ${id}`, { status: 404 });
  return copy(payment);
}

export async function listRefunds(paymentId) {
  await delay();
  return copy(
    refunds
      .filter((r) => r.paymentId === paymentId)
      .sort((a, b) => b.created.localeCompare(a.created)),
  );
}

/**
 * Refunds all or part of a payment. Returns the refund:
 *   { id, paymentId, amount, reason, created }
 *
 * `idempotencyKey` is required. Sending the same key again returns the
 * original refund instead of refunding twice. Reusing a key with different
 * parameters is an error.
 */
export async function createRefund({ paymentId, amount, reason }, { idempotencyKey } = {}) {
  await delay();
  const failure = injectedFailures.shift();
  console.log({ failure });
  if (failure === "network") {
    throw new ApiError("network_error", "Network request failed", {
      status: null,
      retryable: true,
    });
  }
  if (!idempotencyKey) {
    throw new ApiError("missing_idempotency_key", "An idempotency key is required", {
      status: 400,
    });
  }

  const fingerprint = JSON.stringify({ paymentId, amount, reason });
  const previous = idempotency.get(idempotencyKey);
  if (previous) {
    if (previous.fingerprint !== fingerprint) {
      throw new ApiError(
        "idempotency_key_reuse",
        "This idempotency key was used with different parameters",
        {
          status: 409,
        },
      );
    }
    return copy(previous.refund);
  }

  if (failure === "rate_limited") {
    throw new ApiError("rate_limited", "Too many requests", { status: 429, retryable: true });
  }

  const payment = payments.get(paymentId);
  if (!payment) throw new ApiError("not_found", `No payment ${paymentId}`, { status: 404 });
  if (payment.status !== "succeeded" && payment.status !== "partially_refunded") {
    throw new ApiError("payment_not_refundable", `A ${payment.status} payment can't be refunded`, {
      status: 400,
    });
  }
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new ApiError("invalid_amount", "amount must be a positive integer in minor units", {
      status: 400,
    });
  }
  if (amount > payment.amount - payment.amountRefunded) {
    throw new ApiError("amount_too_large", "Refund is larger than the amount left to refund", {
      status: 400,
    });
  }
  if (!REFUND_REASONS.includes(reason)) {
    throw new ApiError("invalid_request", `Unknown reason: ${reason}`, { status: 400 });
  }

  const refund = {
    id: `re_${String(++refundCounter).padStart(4, "0")}`,
    paymentId,
    amount,
    reason,
    created: new Date().toISOString(),
  };
  refunds.push(refund);
  const amountRefunded = payment.amountRefunded + amount;
  payments.set(paymentId, {
    ...payment,
    amountRefunded,
    status: amountRefunded === payment.amount ? "refunded" : "partially_refunded",
  });
  idempotency.set(idempotencyKey, { fingerprint, refund });

  if (failure === "response_lost") {
    throw new ApiError("network_error", "Network request failed", {
      status: null,
      retryable: true,
    });
  }
  return copy(refund);
}
