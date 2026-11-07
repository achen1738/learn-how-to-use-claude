// Counts delivery outcomes per endpoint by listening to the event bus.

export class DeliveryMetrics {
  #byEndpoint = new Map();
  #unsubscribers = [];

  #bucket(endpointId) {
    if (!this.#byEndpoint.has(endpointId)) {
      this.#byEndpoint.set(endpointId, { succeeded: 0, failed: 0, attempts: 0 });
    }
    return this.#byEndpoint.get(endpointId);
  }

  attach(bus) {
    this.#unsubscribers.push(
      bus.on("delivery.succeeded", ({ endpoint, attempts }) => {
        const bucket = this.#bucket(endpoint.id);
        bucket.succeeded++;
        bucket.attempts += attempts;
      }),
      bus.on("delivery.failed", ({ endpoint, attempts }) => {
        const bucket = this.#bucket(endpoint.id);

        bucket.failed++;
        bucket.attempts += attempts;
      }),
    );
    return this;
  }

  detach() {
    for (const unsubscribe of this.#unsubscribers.splice(0)) unsubscribe();
  }

  forEndpoint(endpointId) {
    return { ...this.#bucket(endpointId) };
  }

  /** Totals across all endpoints. */
  snapshot() {
    const totals = { succeeded: 0, failed: 0, attempts: 0 };
    for (const bucket of this.#byEndpoint.values()) {
      totals.succeeded += bucket.succeeded;
      totals.failed += bucket.failed;
      totals.attempts += bucket.attempts;
    }
    return totals;
  }
}
