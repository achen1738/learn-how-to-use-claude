// Part 1: implement these. The exact behaviour is in README.md, and
// test/refundLogic.test.js checks it.
import { PAYMENT_STATUSES, REFUND_REASONS } from "../lib/api.js";
import { parseAmount, formatMoney } from "../lib/money.js";

function isStringInteger(str) {
  // Check for empty strings or strings with just spaces, as Number() converts them to 0
  if (typeof str !== "string" || str.trim() === "") return false;

  return Number.isInteger(Number(str));
}

export function refundableAmount(payment) {
  const { id, amount, amountRefunded, status, ...rest } = payment;
  if (status === PAYMENT_STATUSES[0] || status === PAYMENT_STATUSES[1]) {
    return amount - amountRefunded;
  }

  return 0;
}

export function validateRefund(payment, { amountInput, reason }) {
  const errors = { errors: {} };
  if (!REFUND_REASONS.includes(reason)) {
    errors.errors = { ...errors.errors, reason: "Choose a reason" };
  }

  const { status, currency, amount } = payment;

  if (status === "failed") {
    return { errors: { form: "This payment can't be refunded" } };
  }

  const amountInMinorUnits = parseAmount(amountInput, currency);

  if (amountInMinorUnits === null) {
    if (isStringInteger(amountInput)) {
    }
    errors.errors = { ...errors.errors, amount: "Enter a valid amount" };
  }

  if (amountInMinorUnits !== null && amountInMinorUnits <= 0) {
    errors.errors = { ...errors.errors, amount: "Amount must be greater than zero" };
  }

  const refund = refundableAmount(payment);

  if (amountInMinorUnits !== null && amountInMinorUnits > refund) {
    errors.errors = {
      ...errors.errors,
      amount: `You can refund at most ${formatMoney(refund, currency)}`,
    };
  }

  if (Object.keys(errors.errors).length) {
    return errors;
  }
  return { value: { amount: amountInMinorUnits, reason } };
}

export function applyRefund(payment, refund) {
  const newAmountRefunded = payment.amountRefunded + refund.amount;
  const newStatus = newAmountRefunded === payment.amount ? "refunded" : "partially_refunded";

  return { ...payment, amountRefunded: newAmountRefunded, status: newStatus };
}
