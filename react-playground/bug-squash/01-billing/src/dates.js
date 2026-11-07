// Calendar helpers for billing periods.
//
// All dates are UTC calendar days; the time of day is ignored. Billing
// periods are half-open intervals [start, end): a monthly period that starts
// on April 1 has end = May 1, and May 1 itself belongs to the next period.

export const MS_PER_DAY = 24 * 60 * 60 * 1000;

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Accepts a Date or a "YYYY-MM-DD" string and returns a Date at UTC midnight. */
export function parseDate(input) {
  if (input instanceof Date) return startOfDayUTC(input);
  const match = typeof input === "string" && ISO_DATE.exec(input);
  if (!match) throw new TypeError(`Expected a Date or "YYYY-MM-DD", got ${JSON.stringify(input)}`);
  const [, year, month, day] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCMonth() !== month - 1) throw new RangeError(`Invalid calendar date: ${input}`);
  return date;
}

export function startOfDayUTC(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function toISODate(date) {
  return parseDate(date).toISOString().slice(0, 10);
}

/** Whole days from `start` to `end`. daysBetween("2026-04-01", "2026-04-02") === 1. */
export function daysBetween(start, end) {
  return Math.round((parseDate(end) - parseDate(start)) / MS_PER_DAY);
}

function daysInMonth(year, monthIndex) {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

/**
 * Adds calendar months, clamping to the end of shorter months:
 * Jan 31 + 1 month = Feb 28 (or 29 in a leap year).
 */
export function addMonths(input, months) {
  const date = parseDate(input);
  const totalMonths = date.getUTCFullYear() * 12 + date.getUTCMonth() + months;
  const year = Math.floor(totalMonths / 12);
  const monthIndex = totalMonths % 12;
  const day = Math.min(date.getUTCDate(), daysInMonth(year, monthIndex));
  return new Date(Date.UTC(year, monthIndex, day));
}

export function makePeriod(start, end) {
  const period = { start: parseDate(start), end: parseDate(end) };
  if (period.end <= period.start) {
    throw new RangeError(`Period end ${toISODate(period.end)} must be after start ${toISODate(period.start)}`);
  }
  return period;
}

/** The billing period of `interval` ("month" | "year") that starts on `anchor`. */
export function periodStartingOn(anchor, interval = "month") {
  const months = { month: 1, year: 12 }[interval];
  if (!months) throw new RangeError(`Unknown interval: ${interval}`);
  return makePeriod(anchor, addMonths(anchor, months));
}

export function daysInPeriod(period) {
  return daysBetween(period.start, period.end);
}

export function isWithinPeriod(period, input) {
  const date = parseDate(input);
  return date >= period.start && date < period.end;
}
