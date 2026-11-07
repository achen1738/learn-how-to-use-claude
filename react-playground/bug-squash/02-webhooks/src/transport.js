// The transport is the only part that talks to the network. The dispatcher
// depends on the interface below, so tests can swap in a scripted fake.
//
//   send({ url, headers, body }) -> Promise<{ status }>   resolves on 2xx
//                                                         rejects with DeliveryError otherwise

export class DeliveryError extends Error {
  /**
   * @param {string} message
   * @param {{status?: number|null, cause?: unknown}} [details]
   *   `status` is the HTTP status, or null when no response arrived (DNS
   *   failure, connection reset, timeout).
   */
  constructor(message, { status = null, cause } = {}) {
    super(message, { cause });
    this.name = "DeliveryError";
    this.status = status;
  }
}

/**
 * Whether a failed delivery is worth retrying. Network failures, rate limits
 * and server errors are usually transient; other 4xx responses mean the
 * receiver rejected the event and will keep rejecting it.
 */
export function isRetryable(error) {
  if (!(error instanceof DeliveryError)) return false;
  if (error.status === null) return true;
  return error.status === 408 || error.status === 429 || error.status >= 500;
}

export class HttpTransport {
  #timeoutMs;

  constructor({ timeoutMs = 10_000 } = {}) {
    this.#timeoutMs = timeoutMs;
  }

  async send({ url, headers, body }) {
    let response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers,
        body,
        redirect: "error",
        signal: AbortSignal.timeout(this.#timeoutMs),
      });
    } catch (cause) {
      throw new DeliveryError(`Request to ${url} failed: ${cause.message}`, { cause });
    }
    if (!response.ok) {
      throw new DeliveryError(`${url} responded ${response.status}`, { status: response.status });
    }
    return { status: response.status };
  }
}
