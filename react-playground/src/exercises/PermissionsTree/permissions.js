// Dummy data for the Role Permissions exercise.
//
// PERMISSIONS is a nested, deep-frozen tree. Groups have `children`; leaves
// (the actual permissions) don't. Only leaves can be granted; a group's
// checkbox state is always worked out from the leaves under it.
//
//   group: { id, label, children: [...] }
//   leaf:  { id, label, description, locked?: "on" | "off", lockedReason? }
//
// A locked leaf can't be changed by the user:
//   locked: "on"   always granted (required by every role)
//   locked: "off"  never grantable (needs a higher plan or the Owner role)
//
// INITIAL_GRANTED is the role's saved state: the leaf ids it currently has.
// It already includes every locked "on" leaf and no locked "off" leaf.

const leaf = (id, label, description, lock) => ({ id, label, description, ...lock });
const group = (id, label, children) => ({ id, label, children });

const ALWAYS_ON = { locked: "on", lockedReason: "Required for every role" };
const OWNER_ONLY = { locked: "off", lockedReason: "Only the account Owner can have this" };
const ENTERPRISE_ONLY = { locked: "off", lockedReason: "Available on the Enterprise plan" };

const TREE = [
  group("billing", "Billing", [
    group("invoices", "Invoices", [
      leaf("invoices.view", "View invoices", "See invoices and their line items"),
      leaf("invoices.create", "Create invoices", "Draft and send new invoices"),
      leaf("invoices.void", "Void invoices", "Cancel an open invoice"),
      leaf("invoices.refund", "Issue refunds", "Refund all or part of a paid invoice"),
    ]),
    group("subscriptions", "Subscriptions", [
      leaf("subscriptions.view", "View subscriptions", "See plans, renewals and history"),
      leaf("subscriptions.manage", "Change subscriptions", "Upgrade, downgrade and apply coupons"),
      leaf("subscriptions.cancel", "Cancel subscriptions", "End a customer's subscription"),
    ]),
    group("payouts", "Payouts", [
      leaf("payouts.view", "View payouts", "See payout schedule and history"),
      leaf("payouts.initiate", "Send payouts", "Move funds to the bank account", OWNER_ONLY),
      leaf("payouts.bank", "Change bank account", "Edit the payout destination", OWNER_ONLY),
    ]),
  ]),
  group("customers", "Customers", [
    leaf("customers.view", "View customers", "See customer profiles"),
    leaf("customers.create", "Create customers", "Add new customers"),
    leaf("customers.edit", "Edit customers", "Change names, emails and addresses"),
    leaf("customers.delete", "Delete customers", "Permanently remove a customer"),
    group("customers-data", "Personal data", [
      leaf("customers.pii.view", "View full card and ID details", "Unmasked personal data"),
      leaf("customers.pii.export", "Export personal data", "Download a customer's data (GDPR requests)"),
    ]),
  ]),
  group("developers", "Developers", [
    group("api", "API keys", [
      group("api-test", "Test mode", [
        leaf("api.test.view", "View test keys", "See publishable and secret test keys"),
        leaf("api.test.roll", "Roll test keys", "Replace test keys"),
      ]),
      group("api-live", "Live mode", [
        leaf("api.live.view", "View live keys", "See live publishable keys"),
        leaf("api.live.secret", "Reveal live secret key", "Show the live secret key once", OWNER_ONLY),
        leaf("api.live.roll", "Roll live keys", "Replace live keys; breaks existing integrations"),
      ]),
    ]),
    group("webhooks", "Webhooks", [
      leaf("webhooks.view", "View webhooks", "See endpoints and delivery attempts"),
      leaf("webhooks.manage", "Manage webhooks", "Add, edit and remove endpoints"),
      leaf("webhooks.resend", "Resend events", "Retry failed deliveries"),
    ]),
    leaf("logs.view", "View request logs", "API request and response logs"),
  ]),
  group("team", "Team", [
    leaf("team.view", "View team members", "See who has access"),
    leaf("team.invite", "Invite members", "Send invitations"),
    leaf("team.remove", "Remove members", "Revoke someone's access"),
    leaf("team.roles", "Change roles", "Assign roles to members", OWNER_ONLY),
  ]),
  group("settings", "Settings", [
    group("settings-account", "Account", [
      leaf("settings.account.view", "View account settings", "Business name, address, timezone", ALWAYS_ON),
      leaf("settings.account.edit", "Edit account settings", "Change business details"),
    ]),
    group("settings-branding", "Branding", [
      leaf("settings.branding.edit", "Edit branding", "Logo, colours and email templates"),
    ]),
    group("settings-security", "Security", [
      leaf("settings.security.2fa", "Enforce two-factor auth", "Require 2FA for all members"),
      leaf("settings.security.sso", "Configure single sign-on", "Connect an identity provider", ENTERPRISE_ONLY),
      leaf("settings.security.ip", "IP allowlist", "Restrict dashboard access by IP", ENTERPRISE_ONLY),
    ]),
  ]),
  group("compliance", "Compliance", [
    leaf("compliance.audit.view", "View audit log", "Who did what, and when", ALWAYS_ON),
    leaf("compliance.terms", "View signed terms", "Agreements accepted by the account", ALWAYS_ON),
  ]),
  group("reports", "Reports", [
    leaf("reports.view", "View reports", "Revenue, churn and MRR dashboards"),
    leaf("reports.export", "Export reports", "Download as CSV"),
    leaf("reports.schedule", "Schedule reports", "Email reports on a schedule"),
  ]),
];

function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

export const PERMISSIONS = deepFreeze(TREE);

// The "Support agent" role as saved on the server.
export const INITIAL_GRANTED = deepFreeze([
  "invoices.view",
  "subscriptions.view",
  "subscriptions.manage",
  "payouts.view",
  "customers.view",
  "customers.edit",
  "webhooks.view",
  "team.view",
  "settings.account.view",
  "compliance.audit.view",
  "compliance.terms",
  "reports.view",
]);

// Presets for the stretch goal. Locked leaves still win: presets can't grant a
// locked "off" leaf or remove a locked "on" one.
export const PRESETS = deepFreeze({
  "Read only": ["*.view"],
  Developer: ["api.*", "webhooks.*", "logs.view"],
  Everything: ["*"],
});
