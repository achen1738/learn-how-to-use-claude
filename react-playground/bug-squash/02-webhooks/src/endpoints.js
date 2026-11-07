// Subscriber endpoints and the event types they listen to.
//
// Event type patterns:
//   "*"               every event
//   "invoice.*"       every event whose type starts with "invoice."
//   "invoice.paid"    exactly that type

export function matchesPattern(pattern, eventType) {
  if (pattern === "*") return true;
  if (pattern.endsWith(".*")) return eventType.startsWith(pattern.slice(0, -1));
  return pattern === eventType;
}

export class EndpointRegistry {
  #endpoints = new Map();

  add({ id, url, secret, events = ["*"], enabled = true }) {
    if (this.#endpoints.has(id)) throw new Error(`Endpoint ${id} already exists`);
    if (!/^https:\/\//.test(url)) throw new Error(`Endpoint ${id} must use https, got ${url}`);
    if (!secret) throw new Error(`Endpoint ${id} needs a signing secret`);
    if (events.length === 0) throw new Error(`Endpoint ${id} must subscribe to at least one event type`);

    const endpoint = Object.freeze({ id, url, secret, events: [...events], enabled });
    this.#endpoints.set(id, endpoint);
    return endpoint;
  }

  get(id) {
    const endpoint = this.#endpoints.get(id);
    if (!endpoint) throw new Error(`Unknown endpoint ${id}`);
    return endpoint;
  }

  setEnabled(id, enabled) {
    const endpoint = this.get(id);
    this.#endpoints.set(id, Object.freeze({ ...endpoint, enabled }));
  }

  remove(id) {
    return this.#endpoints.delete(id);
  }

  /** Enabled endpoints subscribed to `eventType`, in registration order. */
  matching(eventType) {
    return [...this.#endpoints.values()].filter(
      (endpoint) => endpoint.enabled && endpoint.events.some((pattern) => matchesPattern(pattern, eventType)),
    );
  }
}
