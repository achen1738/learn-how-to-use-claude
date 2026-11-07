// Time is injected everywhere so that tests can control it.
//
// RealClock wraps the platform timers. FakeClock never moves on its own: tests
// call advance() or runAll() to fire pending sleeps in order, and each sleeper
// gets to run its follow-up code before the next timer fires.

export class RealClock {
  now() {
    return Date.now();
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/** Lets every queued promise callback run to completion. */
export const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

export class FakeClock {
  #now;
  #timers = [];
  #sequence = 0;

  constructor(start = 0) {
    this.#now = start;
  }

  now() {
    return this.#now;
  }

  sleep(ms) {
    if (!(ms >= 0)) throw new RangeError(`sleep() needs a non-negative duration, got ${ms}`);
    return new Promise((resolve) => {
      this.#timers.push({ at: this.#now + ms, sequence: this.#sequence++, resolve });
    });
  }

  get pendingTimers() {
    return this.#timers.length;
  }

  #takeNext(limit = Infinity) {
    let next = null;
    for (const timer of this.#timers) {
      if (timer.at > limit) continue;
      if (!next || timer.at < next.at || (timer.at === next.at && timer.sequence < next.sequence)) {
        next = timer;
      }
    }
    if (next) this.#timers.splice(this.#timers.indexOf(next), 1);
    return next;
  }

  async #fire(timer) {
    this.#now = timer.at;
    timer.resolve();
    await flushPromises();
  }

  /** Moves time forward by `ms`, firing every timer that comes due on the way. */
  async advance(ms) {
    const target = this.#now + ms;
    await flushPromises();
    for (let timer = this.#takeNext(target); timer; timer = this.#takeNext(target)) {
      await this.#fire(timer);
    }
    this.#now = target;
  }

  /** Fires timers, including ones scheduled along the way, until none are left. */
  async runAll({ maxTimers = 1000 } = {}) {
    await flushPromises();
    for (let fired = 0; this.#timers.length > 0; fired++) {
      if (fired >= maxTimers) throw new Error(`runAll() fired ${maxTimers} timers; is something rescheduling forever?`);
      await this.#fire(this.#takeNext());
    }
  }
}
