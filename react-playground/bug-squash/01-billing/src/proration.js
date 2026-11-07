import { daysBetween, daysInPeriod, isWithinPeriod, makePeriod, toISODate } from "./dates.js";
import { fromDecimal, multiply, negate } from "./money.js";

// When a customer switches plans partway through a billing period they get:
//
//   1. a credit for the unused part of the old plan, and
//   2. a charge for the rest of the period on the new plan.
//
// Both are proportional to the number of days left in the period. The change
// takes effect at the start of `changeDate`.

/**
 * Fraction of `period` that is still left on `changeDate`.
 * A change on the first day of the period leaves the whole period (1).
 */
export function remainingFraction(period, changeDate) {
  if (!isWithinPeriod(period, changeDate)) {
    throw new RangeError(
      `Change date ${toISODate(changeDate)} is outside the period ` +
        `${toISODate(period.start)} to ${toISODate(period.end)}`,
    );
  }
  const totalDays = daysInPeriod(period);

  // Count the change date itself as a remaining day: the customer has the new
  // plan from that day on.
  const remainingDays = daysBetween(changeDate, period.end);
  return remainingDays / totalDays;
}

/**
 * Proration line items for a plan change.
 *
 * @param {object} change
 * @param {string} change.currency
 * @param {{start: string|Date, end: string|Date}} change.period  The current billing period.
 * @param {string|Date} change.changeDate
 * @param {{productId: string, name: string, price: number}} change.from  Old plan (decimal price per period).
 * @param {{productId: string, name: string, price: number}} change.to    New plan.
 */
export function prorationItems({ currency, period, changeDate, from, to }) {
  const fraction = remainingFraction(makePeriod(period.start, period.end), changeDate);
  const credit = negate(multiply(fromDecimal(from.price, currency), fraction));
  const charge = multiply(fromDecimal(to.price, currency), fraction);
  return [
    {
      productId: from.productId,
      description: `Unused time on ${from.name}`,
      amount: credit,
      proration: true,
    },
    {
      productId: to.productId,
      description: `Remaining time on ${to.name}`,
      amount: charge,
      proration: true,
    },
  ];
}
