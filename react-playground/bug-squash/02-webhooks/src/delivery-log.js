// An append-only record of every delivery attempt, for the dashboard's
// "recent deliveries" view and for support investigations.
//
// Entry shape:
//   { eventId, endpointId, attempt, at, ok, status, error }

export class DeliveryLog {
  #entries = [];
  #capacity;

  constructor({ capacity = 10_000 } = {}) {
    this.#capacity = capacity;
  }

  record(entry) {
    this.#entries.push(Object.freeze({ ...entry }));
    if (this.#entries.length > this.#capacity) this.#entries.shift();
  }

  all() {
    return [...this.#entries];
  }

  forEvent(eventId) {
    return this.#entries.filter((entry) => entry.eventId === eventId);
  }

  forEndpoint(endpointId) {
    return this.#entries.filter((entry) => entry.endpointId === endpointId);
  }

  get size() {
    return this.#entries.length;
  }
}
