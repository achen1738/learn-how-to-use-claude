import { allocate, isZero, min, money, multiply, sum, zero } from "./money.js";

// A coupon takes either a percentage or a fixed amount off:
//
//   { id: "LAUNCH20", percentOff: 20 }
//   { id: "TENOFF", amountOff: { amount: 1000, currency: "USD" } }
//
// An optional `appliesTo` array of product ids restricts the coupon to those
// products. The discount is spread across the eligible lines in proportion to
// their amounts so that per-line tax can be computed on the discounted price.

export class InvalidCouponError extends Error {
  constructor(message) {
    super(message);
    this.name = "InvalidCouponError";
  }
}

function validateCoupon(coupon) {
  const hasPercent = coupon.percentOff != null;
  const hasAmount = coupon.amountOff != null;
  if (hasPercent === hasAmount) {
    throw new InvalidCouponError(`Coupon ${coupon.id} must have exactly one of percentOff or amountOff`);
  }
  if (hasPercent && !(coupon.percentOff > 0 && coupon.percentOff <= 100)) {
    throw new InvalidCouponError(`Coupon ${coupon.id} percentOff must be in (0, 100]`);
  }
}

function isEligible(line, coupon) {
  return !coupon.appliesTo || coupon.appliesTo.includes(line.productId);
}

/** The total discount a coupon gives on an eligible subtotal. */
export function discountFor(coupon, eligibleSubtotal) {
  validateCoupon(coupon);
  if (coupon.percentOff != null) {
    return multiply(eligibleSubtotal, coupon.percentOff / 100);
  }
  const amountOff = money(coupon.amountOff.amount, coupon.amountOff.currency);
  // A fixed discount can never exceed what it applies to.
  return min(amountOff, eligibleSubtotal);
}

/**
 * Returns a copy of `lines` where each line has a `discount` (Money). Lines
 * the coupon doesn't apply to get a zero discount.
 */
export function applyCoupon(lines, coupon, currency) {
  if (!coupon) return lines.map((line) => ({ ...line, discount: zero(currency) }));

  const eligible = lines.filter((line) => isEligible(line, coupon));
  const eligibleSubtotal = sum(eligible.map((line) => line.amount), currency);
  if (eligible.length === 0 || isZero(eligibleSubtotal)) {
    return lines.map((line) => ({ ...line, discount: zero(currency) }));
  }

  const total = discountFor(coupon, eligibleSubtotal);
  const shares = allocate(total, eligible.map((line) => line.amount.amount));
  const shareByLine = new Map(eligible.map((line, i) => [line, shares[i]]));

  return lines.map((line) => ({ ...line, discount: shareByLine.get(line) ?? zero(currency) }));
}
