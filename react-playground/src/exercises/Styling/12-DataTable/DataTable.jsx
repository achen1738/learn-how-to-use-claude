import "./DataTable.css";

// 12 · Data Table. The full prompt is in README.md in this folder.
// Write all styles in DataTable.css. Prefix classes with "data-table".

const FIRST = ["Priya", "Sam", "Jordan", "Alex", "Maximilian", "Ana", "Kenji", "Fatima", "Liam", "Zoe"];
const LAST = ["Patel", "Lee", "Rivera", "Kim", "Featherstonehaugh", "Silva", "Tanaka", "Haddad", "O'Brien", "Novak"];
const ROLES = ["Admin", "Member", "Billing", "Viewer"];
const STATUSES = ["Active", "Active", "Active", "Invited", "Suspended"];
const PLANS = ["Free", "Team", "Business", "Enterprise"];
const COMPANIES = ["Acme", "Globex Corporation International", "Initech", "Umbrella", "Hooli"];

// 40 users, generated the same way every time.
export const USERS = Array.from({ length: 40 }, (_, i) => {
  const first = FIRST[i % FIRST.length];
  const last = LAST[(i * 3) % LAST.length];
  const company = COMPANIES[i % COMPANIES.length];
  return {
    id: `u${i + 1}`,
    name: `${first} ${last}`,
    email: `${first}.${last}${i}@${company.split(" ")[0]}-workspace-example.com`
      .toLowerCase()
      .replace("'", ""),
    company,
    role: ROLES[(i * 7) % ROLES.length],
    status: STATUSES[(i * 5) % STATUSES.length],
    plan: PLANS[(i * 11) % PLANS.length],
    seats: ((i * 37) % 250) + 1,
    mrrCents: ((i * 7919) % 900000) + 1200,
    lastActive: new Date(Date.UTC(2026, 9, 30) - ((i * 13) % 60) * 86400000)
      .toISOString()
      .slice(0, 10),
  };
});

// Column definitions you can map over. `align: "end"` columns are numbers.
export const TABLE_COLUMNS = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "company", label: "Company" },
  { key: "role", label: "Role" },
  { key: "status", label: "Status" },
  { key: "plan", label: "Plan" },
  { key: "seats", label: "Seats", align: "end" },
  { key: "mrrCents", label: "MRR", align: "end" },
  { key: "lastActive", label: "Last active" },
];

export const formatMoney = (cents) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

export function DataTable() {
  // TODO: sort state, the table, and the scroll container.
  return (
    <div>
      <h2>Data Table</h2>
      <p>See README.md for the prompt.</p>
      <p>{USERS.length} users loaded.</p>
    </div>
  );
}
