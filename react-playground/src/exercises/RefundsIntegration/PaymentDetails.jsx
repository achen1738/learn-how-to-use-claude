import { formatMoney } from "./lib/money.js";
import { Badge, STATUS_DISPLAY } from "./ui/index.jsx";

export function PaymentDetails({ payment }) {
  if (!payment) {
    return <p style={{ color: "#5b6576" }}>Select a payment to see its details.</p>;
  }

  const status = STATUS_DISPLAY[payment.status];
  const rows = [
    ["Amount", formatMoney(payment.amount, payment.currency)],
    ["Refunded", formatMoney(payment.amountRefunded, payment.currency)],
    ["Customer", `${payment.customer.name} (${payment.customer.email})`],
    ["Description", payment.description],
    ["Created", new Date(payment.created).toLocaleString()],
  ];

  return (
    <section aria-label="Payment details">
      <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {payment.id} <Badge tone={status.tone}>{status.label}</Badge>
      </h3>
      <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "4px 12px" }}>
        {rows.map(([label, value]) => (
          <div key={label} style={{ display: "contents" }}>
            <dt style={{ color: "#5b6576" }}>{label}</dt>
            <dd style={{ margin: 0 }}>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
