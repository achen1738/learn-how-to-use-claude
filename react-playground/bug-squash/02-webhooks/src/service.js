import { RealClock } from "./clock.js";
import { DeliveryLog } from "./delivery-log.js";
import { Dispatcher } from "./dispatcher.js";
import { EndpointRegistry } from "./endpoints.js";
import { EventBus } from "./event-bus.js";
import { DeliveryMetrics } from "./metrics.js";

// Wires the pieces together the way production does.
//
// Health starts as "starting" and flips to "healthy" after the first
// successful delivery, which is what the load balancer's readiness probe
// waits for.

export function createWebhookService({
  transport,
  clock = new RealClock(),
  backoff,
  maxAttempts,
  onListenerError,
} = {}) {
  const bus = new EventBus({ onListenerError });
  const registry = new EndpointRegistry();
  const log = new DeliveryLog();

  let status = "starting";

  bus.once("delivery.succeeded", () => {
    status = "healthy";
  });
  const metrics = new DeliveryMetrics().attach(bus);
  const dispatcher = new Dispatcher({ registry, transport, clock, bus, log, backoff, maxAttempts });

  return {
    bus,
    registry,
    log,
    metrics,
    dispatcher,
    health: () => ({ status }),
  };
}
