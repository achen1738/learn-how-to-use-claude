import { RealClock } from "./clock.js";
import { DeliveryLog } from "./delivery-log.js";
import { EventBus } from "./event-bus.js";
import { DEFAULT_BACKOFF, withRetry } from "./retry.js";
import { SIGNATURE_HEADER, signPayload } from "./signing.js";
import { isRetryable } from "./transport.js";

// Delivers events to every endpoint subscribed to them.
//
// For each (event, endpoint) pair the dispatcher signs the body, sends it with
// retries, records every attempt in the delivery log, and finally announces
// the outcome on the bus as "delivery.succeeded" or "delivery.failed".
//
// An event looks like: { id: "evt_123", type: "invoice.paid", created: 1767225600, data: {...} }

export const DEFAULT_MAX_ATTEMPTS = 4;

function summarize(outcomes) {
  return {
    delivered: outcomes.filter((outcome) => outcome.ok).length,
    failed: outcomes.filter((outcome) => !outcome.ok).length,
  };
}

function mergeSummaries(summaries) {
  return summaries.reduce(
    (total, summary) => ({
      delivered: total.delivered + summary.delivered,
      failed: total.failed + summary.failed,
    }),
    { delivered: 0, failed: 0 },
  );
}

export class Dispatcher {
  #registry;
  #transport;
  #clock;
  #bus;
  #log;
  #backoff;
  #maxAttempts;

  constructor({
    registry,
    transport,
    clock = new RealClock(),
    bus = new EventBus(),
    log = new DeliveryLog(),
    backoff = DEFAULT_BACKOFF,
    maxAttempts = DEFAULT_MAX_ATTEMPTS,
  }) {
    this.#registry = registry;
    this.#transport = transport;
    this.#clock = clock;
    this.#bus = bus;
    this.#log = log;
    this.#backoff = backoff;
    this.#maxAttempts = maxAttempts;
  }

  /** Delivers one event to all matching endpoints in parallel. */
  async dispatch(event) {
    const endpoints = this.#registry.matching(event.type);
    const outcomes = await Promise.all(endpoints.map((endpoint) => this.#deliver(event, endpoint)));
    return summarize(outcomes);
  }

  /** Delivers a batch of events, e.g. when replaying after an outage. */
  async dispatchAll(events) {
    const summaries = [];
    events.forEach((event) => {
      summaries.push(this.dispatch(event));
    });
    return mergeSummaries(await Promise.all(summaries));
  }

  async #deliver(event, endpoint) {
    const body = JSON.stringify(event);

    const outcome = await withRetry((attempt) => this.#attempt(event, endpoint, body, attempt), {
      clock: this.#clock,
      maxAttempts: this.#maxAttempts,
      backoff: this.#backoff,
      isRetryable,
    });

    const detail = {
      event,
      endpoint: { id: endpoint.id, url: endpoint.url },
      attempts: outcome.attempts,
    };
    if (outcome.ok) {
      this.#bus.emit("delivery.succeeded", detail);
    } else {
      this.#bus.emit("delivery.failed", { ...detail, error: outcome.error });
    }
    return outcome;
  }

  async #attempt(event, endpoint, body, attempt) {
    const at = this.#clock.now();
    const headers = {
      "Content-Type": "application/json",
      "Webhook-Id": event.id,
      "Webhook-Attempt": String(attempt),
      [SIGNATURE_HEADER]: signPayload(body, endpoint.secret, at),
    };
    const entry = { eventId: event.id, endpointId: endpoint.id, attempt, at };

    try {
      const response = await this.#transport.send({ url: endpoint.url, headers, body });
      this.#log.record({ ...entry, ok: true, status: response.status, error: null });
      return response;
    } catch (error) {
      this.#log.record({ ...entry, ok: false, status: error.status ?? null, error: error.message });
      throw error;
    }
  }
}
