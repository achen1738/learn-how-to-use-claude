import { Badge, Banner, Button, Select, STATUS_DISPLAY, Modal, TextField } from "./ui/index.jsx";
import { useState, useEffect } from "react";
import { REFUND_REASONS, createRefund } from "./lib/api.js";
import { applyRefund, refundableAmount, validateRefund } from "./features/refundLogic.js";
import { formatMoney, toDecimalString } from "./lib/money.js";
export const PaymentModal = ({ showBanner, updatePayment, payment, open, onClose }) => {
  const [value, setValue] = useState(null);
  const [errors, setErrors] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [createRefundError, setRefundError] = useState(null);
  const [refundKey, setRefundKey] = useState(crypto.randomUUID());
  // 2. Define the change event handler
  const handleInputChange = (event) => {
    // event.target points to the input element
    // event.target.value contains the typed text
    setValue(event.target.value);
    setRefundKey(crypto.randomUUID());
  };

  useEffect(() => {
    setRefundKey(crypto.randomUUID());
  }, [payment]);

  const handleSubmit = async (e) => {
    try {
      setErrors(null);
      setIsLoading(true);

      e.preventDefault();

      // 2. Pass the form element directly to FormData
      const formData = new FormData(e.currentTarget);

      const { amount, reason } = Object.fromEntries(formData.entries());

      const validatedRefund = validateRefund(payment, { amountInput: amount, reason });
      if (validatedRefund.errors) {
        setErrors(validatedRefund);
      } else {
        const newRefund = await createRefund(
          { paymentId: payment.id, amount: validatedRefund.value.amount, reason },
          { idempotencyKey: refundKey },
        );

        setIsLoading(false);
        updatePayment(newRefund.paymentId, (prevPayment) => {
          return applyRefund(prevPayment, newRefund);
        });
        showBanner();
        onClose();
        setRefundError(null);
      }
    } catch (e) {
      setIsLoading(false);
      setRefundError(e);
    }
  };

  const amountToRefund = refundableAmount(payment);
  const formattedMoney = formatMoney(amountToRefund, payment.currency);
  const defaultValueToRefund = toDecimalString(amountToRefund, payment.currency);
  return (
    <Modal open={open} onClose={onClose} title={`Refund ${payment?.id}`}>
      <form onSubmit={handleSubmit}>
        <TextField
          defaultValue={defaultValueToRefund}
          onChange={handleInputChange}
          hint={`Up to ${formattedMoney}`}
          name="amount"
          error={errors?.errors?.amount}
        />
        <Select
          label="Choose a reason"
          name="reason"
          onChange={() => {
            setRefundKey(crypto.randomUUID());
          }}
          options={[
            { label: "Requested by customer", value: REFUND_REASONS[0] },
            { label: "Duplicated", value: REFUND_REASONS[1] },
            { label: "Fraudulent", value: REFUND_REASONS[2] },
          ]}
          error={errors?.errors?.reason}
        />
        <Button type="submit" loading={isLoading} disabled={isLoading}>
          {value !== "" ? `Refund ${formattedMoney ?? defaultValueToRefund}` : "Refund"}
        </Button>
        <Button onClick={onClose} disabled={isLoading}>
          Close
        </Button>
      </form>
      <ErrorComponent refundError={createRefundError} />
    </Modal>
  );
};

const ErrorComponent = ({ refundError }) => {
  if (!refundError) return null;
  const { code, message } = refundError;
  let ourMessage = `Something went wrong (${code}).`;
  if (message === "network_error" || message === "rate_limited") {
    ourMessage = "We couldn't reach the server. Try again.";
  } else if (message === "payment_not_refundable" || message === "amount_too_large") {
    ourMessage = "This payment changed since you opened it. Check the amount and try again.";
  }
  return (
    <div>
      <h4>Error</h4>
      {ourMessage}
    </div>
  );
};
