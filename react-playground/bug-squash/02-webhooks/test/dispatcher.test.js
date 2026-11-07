import { test } from "node:test";
import assert from "node:assert/strict";
import { DeliveryLog, Dispatcher, EndpointRegistry, EventBus, FakeClock, SIGNATURE_HEADER, verifySignature } from "../src/index.js";
import { FakeTransport } from "../support/fake-transport.js";

const BILLING = "https://billing.example/hook";
const CRM = "https://crm.example/hook";

function setup(scripts = {}) {
  const clock = new FakeClock(Date.UTC(2026, 0, 1));
  const registry = new EndpointRegistry();
  registry.add({ id: "we_billing", url: BILLING, secret: "whsec_billing", events: ["invoice.*"] });
  registry.add({ id: "we_crm", url: CRM, secret: "whsec_crm", events: ["customer.*", "invoice.paid"] });
  const transport = new FakeTransport(scripts);
  const bus = new EventBus();
  const log = new DeliveryLog();
  const dispatcher = new Dispatcher({ registry, transport, clock, bus, log });
  return { clock, transport, bus, log, dispatcher };
}

const event = (id, type) => ({ id, type, created: 1767225600, data: { object: { id: `obj_${id}` } } });

test("delivers an event to every subscribed endpoint", async () => {
  const { dispatcher, transport, clock } = setup();
  const pending = dispatcher.dispatch(event("evt_1", "invoice.paid"));
  await clock.runAll();

  assert.deepEqual(await pending, { delivered: 2, failed: 0 });
  assert.deepEqual(
    transport.requests.map((r) => r.url),
    [BILLING, CRM],
  );
});

test("each request carries a valid signature for its endpoint", async () => {
  const { dispatcher, transport, clock } = setup();
  const pending = dispatcher.dispatch(event("evt_1", "invoice.paid"));
  await clock.runAll();
  await pending;

  const [request] = transport.requestsTo(CRM);
  assert.equal(request.headers["Webhook-Id"], "evt_1");
  assert.equal(verifySignature(request.body, request.headers[SIGNATURE_HEADER], "whsec_crm", { nowMs: clock.now() }), true);
});

test("retries a failing endpoint on the documented backoff schedule (0s, 1s, 3s)", async () => {
  const { dispatcher, log, clock } = setup({ [BILLING]: [503, "network"] });
  const start = clock.now();
  const pending = dispatcher.dispatch(event("evt_2", "invoice.created"));
  await clock.runAll();

  assert.deepEqual(await pending, { delivered: 1, failed: 0 });
  assert.deepEqual(
    log.forEndpoint("we_billing").map((entry) => [entry.attempt, (entry.at - start) / 1000, entry.ok]),
    [
      [1, 0, false],
      [2, 1, false],
      [3, 3, true],
    ],
  );
});

test("a rejected (4xx) delivery is not retried", async () => {
  const { dispatcher, log, clock, bus } = setup({ [BILLING]: [410] });
  const failures = [];
  bus.on("delivery.failed", ({ endpoint, attempts }) => failures.push([endpoint.id, attempts]));

  const pending = dispatcher.dispatch(event("evt_3", "invoice.voided"));
  await clock.runAll();

  assert.deepEqual(await pending, { delivered: 0, failed: 1 });
  assert.equal(log.forEndpoint("we_billing").length, 1);
  assert.deepEqual(failures, [["we_billing", 1]]);
});

test("an endpoint that keeps failing is abandoned after 4 attempts", async () => {
  const { dispatcher, log, clock } = setup({ [CRM]: [500, 500, 500, 500, 500] });
  const pending = dispatcher.dispatch(event("evt_4", "customer.updated"));
  await clock.runAll();

  assert.deepEqual(await pending, { delivered: 0, failed: 1 });
  assert.equal(log.forEndpoint("we_crm").length, 4);
});

test("dispatchAll reports totals for the whole batch", async () => {
  const { dispatcher, clock } = setup({ [CRM]: [410] });
  const pending = dispatcher.dispatchAll([
    event("evt_5", "invoice.paid"), // billing + crm (crm rejects it)
    event("evt_6", "invoice.created"), // billing
    event("evt_7", "customer.created"), // crm
  ]);
  await clock.runAll();

  assert.deepEqual(await pending, { delivered: 3, failed: 1 });
});
