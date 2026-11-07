import { test } from "node:test";
import assert from "node:assert/strict";
import { createWebhookService, FakeClock } from "../src/index.js";
import { FakeTransport } from "../support/fake-transport.js";

function service(scripts) {
  const clock = new FakeClock(Date.UTC(2026, 0, 1));
  const svc = createWebhookService({ transport: new FakeTransport(scripts), clock });
  svc.registry.add({ id: "we_1", url: "https://one.example/hook", secret: "whsec_1" });
  svc.registry.add({ id: "we_2", url: "https://two.example/hook", secret: "whsec_2", events: ["invoice.*"] });
  return { ...svc, clock };
}

async function send(svc, ...events) {
  for (const evt of events) {
    const pending = svc.dispatcher.dispatch(evt);
    await svc.clock.runAll();
    await pending;
  }
}

test("health turns healthy after the first successful delivery", async () => {
  const svc = service({ "https://one.example/hook": [500] });
  assert.equal(svc.health().status, "starting");
  await send(svc, { id: "evt_1", type: "customer.created" });
  assert.equal(svc.health().status, "healthy");
});

test("metrics count every delivery outcome", async () => {
  const svc = service({ "https://two.example/hook": [400] });
  await send(
    svc,
    { id: "evt_1", type: "customer.created" }, // we_1 ok
    { id: "evt_2", type: "invoice.paid" }, // we_1 ok, we_2 rejected
    { id: "evt_3", type: "invoice.paid" }, // we_1 ok, we_2 ok
  );

  assert.deepEqual(svc.metrics.forEndpoint("we_1"), { succeeded: 3, failed: 0, attempts: 3 });
  assert.deepEqual(svc.metrics.forEndpoint("we_2"), { succeeded: 1, failed: 1, attempts: 2 });
  assert.deepEqual(svc.metrics.snapshot(), { succeeded: 4, failed: 1, attempts: 5 });
});
