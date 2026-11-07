import { useState } from "react";
import { failNextRefund, PAYMENT_STATUSES } from "./lib/api.js";
import { formatMoney } from "./lib/money.js";
import { usePaginatedPayments } from "./lib/usePaginatedPayments.js";
import { PaymentDetails } from "./PaymentDetails.jsx";
import { Badge, Banner, Button, Select, STATUS_DISPLAY, Modal, TextField } from "./ui/index.jsx";
import { refundableAmount } from "./features/refundLogic.js";
import { PaymentModal } from "./PaymentModal.jsx";
const STATUS_OPTIONS = [
  { value: "all", label: "All payments" },
  ...PAYMENT_STATUSES.map((status) => ({ value: status, label: STATUS_DISPLAY[status].label })),
];

export function PaymentsDashboard() {
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const { payments, loading, error, hasMore, loadMore, reload, updatePayment } =
    usePaginatedPayments({ status });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const selected = payments.find((p) => p.id === selectedId) ?? null;
  const [paymentToRefund, setPaymentToRefund] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleShowBanner = () => {
    setShowBanner(true);
  };

  const handleCloseBanner = () => {
    setShowBanner(false);
  };

  return (
    <div
      style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(260px, 1fr)", gap: 24 }}
    >
      <div>
        <h2 style={{ marginTop: 0 }}>Payments</h2>
        <Select
          label="Status"
          options={STATUS_OPTIONS}
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setSelectedId(null);
          }}
        />

        {error && (
          <Banner tone="danger">
            Couldn't load payments.{" "}
            <Button variant="secondary" onClick={reload}>
              Retry
            </Button>
          </Banner>
        )}
        {paymentToRefund && showBanner && (
          <Banner
            onDismiss={handleCloseBanner}
          >{`Refunded ${paymentToRefund.amountRefunded} on ${paymentToRefund.id}`}</Banner>
        )}
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #dde2ea" }}>
              <th>ID</th>
              <th>Customer</th>
              <th style={{ textAlign: "right" }}>Amount</th>
              <th style={{ textAlign: "right" }}>Refunded</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => {
              const display = STATUS_DISPLAY[payment.status];

              const potentialRefund = refundableAmount(payment);

              const isRefundable = potentialRefund > 0;

              return (
                <tr
                  key={payment.id}
                  onClick={() => setSelectedId(payment.id)}
                  aria-selected={payment.id === selectedId}
                  style={{
                    cursor: "pointer",
                    background: payment.id === selectedId ? "#eef0ff" : undefined,
                    borderBottom: "1px solid #f0f2f5",
                  }}
                >
                  <td>
                    <button
                      type="button"
                      onClick={() => setSelectedId(payment.id)}
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        color: "#4f46e5",
                        cursor: "pointer",
                      }}
                    >
                      {payment.id}
                    </button>
                  </td>
                  <td>{payment.customer.name}</td>
                  <td style={{ textAlign: "right" }}>
                    {formatMoney(payment.amount, payment.currency)}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {formatMoney(payment.amountRefunded, payment.currency)}
                  </td>
                  <td>
                    <Badge tone={display.tone}>{display.label}</Badge>
                  </td>
                  {isRefundable && (
                    <td>
                      <Button
                        onClick={() => {
                          handleOpenModal();
                          setPaymentToRefund(payment);
                        }}
                      >
                        Refund
                      </Button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
        {paymentToRefund && (
          <PaymentModal
            updatePayment={updatePayment}
            onClose={handleCloseModal}
            open={isModalOpen}
            payment={paymentToRefund}
            showBanner={handleShowBanner}
          />
        )}
        {loading && <p>Loading…</p>}
        {!loading && payments.length === 0 && !error && <p>No payments match this filter.</p>}
        {hasMore && !loading && (
          <Button variant="secondary" onClick={loadMore}>
            Load more
          </Button>
        )}
      </div>

      <aside>
        <PaymentDetails payment={selected} />
        <DevTools />
      </aside>
    </div>
  );
}

// For manual testing: make the next createRefund call fail in a chosen way.
function DevTools() {
  const [queued, setQueued] = useState([]);
  const queue = (kind) => {
    failNextRefund(kind);
    setQueued((q) => [...q, kind]);
  };
  return (
    <details style={{ marginTop: 32, fontSize: 13 }}>
      <summary>Developer tools</summary>
      <p>Make the next refund request fail:</p>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <Button variant="secondary" onClick={() => queue("network")}>
          Network error
        </Button>
        <Button variant="secondary" onClick={() => queue("response_lost")}>
          Response lost
        </Button>
        <Button variant="secondary" onClick={() => queue("rate_limited")}>
          Rate limited
        </Button>
      </div>
      {queued.length > 0 && <p>Queued this session: {queued.join(", ")}</p>}
    </details>
  );
}
