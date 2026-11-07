import { test } from "node:test";
import assert from "node:assert/strict";
import { EventBus } from "../src/index.js";

test("listeners receive payloads in registration order", () => {
  const bus = new EventBus();
  const calls = [];
  bus.on("ping", (payload) => calls.push(["a", payload]));
  bus.on("ping", (payload) => calls.push(["b", payload]));
  bus.emit("ping", 1);
  assert.deepEqual(calls, [
    ["a", 1],
    ["b", 1],
  ]);
});

test("wildcard listeners see every event with its type", () => {
  const bus = new EventBus();
  const seen = [];
  bus.on("*", (payload, type) => seen.push(type));
  bus.emit("a", null);
  bus.emit("b", null);
  assert.deepEqual(seen, ["a", "b"]);
});

test("unsubscribe stops delivery", () => {
  const bus = new EventBus();
  let count = 0;
  const unsubscribe = bus.on("ping", () => count++);
  bus.emit("ping");
  unsubscribe();
  bus.emit("ping");
  assert.equal(count, 1);
  assert.equal(bus.listenerCount("ping"), 0);
});

test("once() fires a single time", () => {
  const bus = new EventBus();
  let count = 0;
  bus.once("ping", () => count++);
  bus.emit("ping");
  bus.emit("ping");
  assert.equal(count, 1);
});

test("a throwing listener doesn't stop the others", () => {
  const errors = [];
  const bus = new EventBus({ onListenerError: (type, error) => errors.push(error.message) });
  let reached = false;
  bus.on("ping", () => {
    throw new Error("boom");
  });
  bus.on("ping", () => {
    reached = true;
  });
  bus.emit("ping");
  assert.equal(reached, true);
  assert.deepEqual(errors, ["boom"]);
});
