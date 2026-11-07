import { test } from "node:test";
import assert from "node:assert/strict";
import { EndpointRegistry, matchesPattern } from "../src/index.js";

test("event type patterns", () => {
  assert.equal(matchesPattern("*", "invoice.paid"), true);
  assert.equal(matchesPattern("invoice.*", "invoice.paid"), true);
  assert.equal(matchesPattern("invoice.*", "invoices.paid"), false);
  assert.equal(matchesPattern("invoice.paid", "invoice.paid"), true);
  assert.equal(matchesPattern("invoice.paid", "invoice.voided"), false);
});

test("matching() returns enabled subscribers in registration order", () => {
  const registry = new EndpointRegistry();
  registry.add({ id: "we_all", url: "https://all.example/hook", secret: "s1" });
  registry.add({ id: "we_invoices", url: "https://billing.example/hook", secret: "s2", events: ["invoice.*"] });
  registry.add({ id: "we_customers", url: "https://crm.example/hook", secret: "s3", events: ["customer.created"] });

  assert.deepEqual(
    registry.matching("invoice.paid").map((e) => e.id),
    ["we_all", "we_invoices"],
  );

  registry.setEnabled("we_all", false);
  assert.deepEqual(
    registry.matching("invoice.paid").map((e) => e.id),
    ["we_invoices"],
  );
});

test("endpoints must be https and have a secret", () => {
  const registry = new EndpointRegistry();
  assert.throws(() => registry.add({ id: "we_1", url: "http://insecure.example", secret: "s" }), /https/);
  assert.throws(() => registry.add({ id: "we_2", url: "https://ok.example", secret: "" }), /secret/);
});
