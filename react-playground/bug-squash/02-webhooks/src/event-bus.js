// A small synchronous pub/sub bus used to decouple delivery from the things
// that react to it (metrics, health checks, alerting).
//
// Listeners run in the order they were added. A listener that throws is
// reported through `onListenerError` and does not stop the others.

export class EventBus {
  #listeners = new Map();
  #onListenerError;

  constructor({
    onListenerError = (type, error) =>
      console.error(`[event-bus] listener for "${type}" threw`, error),
  } = {}) {
    this.#onListenerError = onListenerError;
  }

  /** Subscribes to `type` ("*" receives every event). Returns an unsubscribe function. */
  on(type, listener) {
    if (typeof listener !== "function") throw new TypeError("listener must be a function");
    if (!this.#listeners.has(type)) this.#listeners.set(type, []);
    this.#listeners.get(type).push(listener);
    return () => this.off(type, listener);
  }

  /** Like on(), but the listener is removed after its first call. */
  once(type, listener) {
    const wrapper = (payload, eventType) => {
      this.off(type, wrapper);
      listener(payload, eventType);
    };
    wrapper.original = listener;
    return this.on(type, wrapper);
  }

  /** Removes a listener added with on() or once(). */
  off(type, listener) {
    const listeners = this.#listeners.get(type);
    if (!listeners) return false;
    const index = listeners.findIndex((l) => l === listener || l.original === listener);
    if (index === -1) return false;
    listeners.splice(index, 1);
    if (listeners.length === 0) this.#listeners.delete(type);
    return true;
  }

  /** Calls every listener for `type`, then the "*" listeners. Returns how many ran. */
  emit(type, payload) {
    let called = 0;
    for (const key of type === "*" ? ["*"] : [type, "*"]) {
      const listeners = this.#listeners.get(key);
      if (!listeners) continue;
      for (const listener of [...listeners]) {
        called++;
        try {
          listener(payload, type);
        } catch (error) {
          this.#onListenerError(type, error);
        }
      }
    }
    return called;
  }

  listenerCount(type) {
    return this.#listeners.get(type)?.length ?? 0;
  }
}
