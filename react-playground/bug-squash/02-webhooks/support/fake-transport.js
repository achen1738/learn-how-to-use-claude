import { DeliveryError } from "../src/transport.js";

/**
 * A transport whose responses are scripted per URL. Each script is a list of
 * HTTP statuses (or "network" for a connection failure) consumed one per
 * request; once a script runs out, requests to that URL succeed with 200.
 *
 *   new FakeTransport({ "https://a.example/hook": [500, 500] })   fails twice, then succeeds
 */
export class FakeTransport {
  #scripts;
  requests = [];

  constructor(scripts = {}) {
    this.#scripts = new Map(Object.entries(scripts).map(([url, steps]) => [url, [...steps]]));
  }

  async send({ url, headers, body }) {
    this.requests.push({ url, headers, body });
    const step = this.#scripts.get(url)?.shift() ?? 200;
    if (step === "network") throw new DeliveryError(`Request to ${url} failed: ECONNRESET`);
    if (step >= 300) throw new DeliveryError(`${url} responded ${step}`, { status: step });
    return { status: step };
  }

  requestsTo(url) {
    return this.requests.filter((request) => request.url === url);
  }
}
