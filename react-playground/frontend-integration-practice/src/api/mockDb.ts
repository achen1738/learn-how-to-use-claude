import type { Ticket, TicketPriority, TicketStatus } from './types';

// In-memory "database" behind the fake API. Generated from a fixed seed so the
// data is the same on every run (and in every test).

const TICKET_COUNT = 61;

const SUBJECTS = [
  'Billing discrepancy on latest invoice',
  'Mobile app crashes on launch',
  'Cannot reset my password',
  'Question about billing cycle dates',
  'Export to CSV is missing columns',
  'Two-factor codes not arriving',
  'Request to upgrade plan',
  'Webhook deliveries are delayed',
  'Refund request for duplicate charge',
  'Dark mode makes charts unreadable',
  'Mobile notifications stopped working',
  'SSO login loops back to sign-in page',
];

const CUSTOMERS = [
  'Bianca Moore',
  'Dev Patel',
  'Hana Sato',
  'Marcus Lee',
  'Priya Raman',
  'Owen Fischer',
  'Lucia Gomez',
  'Tom Becker',
  'Aisha Okafor',
  'Jonas Berg',
];

const ASSIGNEES: (string | null)[] = ['Sam Chen', 'Jordan Kim', 'Riley Park', null, null];
const STATUSES: TicketStatus[] = ['open', 'open', 'pending', 'resolved', 'closed'];
const PRIORITIES: TicketPriority[] = ['low', 'medium', 'medium', 'high', 'urgent'];

// Tickets that are always unassigned, so there are known rows to try actions on.
const ALWAYS_UNASSIGNED = new Set([7, 12]);

const NEWEST_TICKET_TIME = Date.UTC(2026, 9, 20, 17, 0, 0);
const HOURS_BETWEEN_TICKETS = 7;

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generate(): Ticket[] {
  const random = mulberry32(42);
  const pick = <T,>(list: T[]): T => list[Math.floor(random() * list.length)];

  const tickets: Ticket[] = [];
  for (let n = 1; n <= TICKET_COUNT; n++) {
    const hoursAgo = (TICKET_COUNT - n) * HOURS_BETWEEN_TICKETS;
    tickets.push({
      id: `T-${String(n).padStart(4, '0')}`,
      subject: pick(SUBJECTS),
      customer: pick(CUSTOMERS),
      status: pick(STATUSES),
      priority: pick(PRIORITIES),
      assignee: ALWAYS_UNASSIGNED.has(n) ? null : pick(ASSIGNEES),
      createdAt: new Date(NEWEST_TICKET_TIME - hoursAgo * 3_600_000).toISOString(),
    });
  }
  return tickets;
}

let tickets: Ticket[] = generate();

export function getAllTickets(): readonly Ticket[] {
  return tickets;
}

export function saveTicket(updated: Ticket): void {
  tickets = tickets.map((t) => (t.id === updated.id ? updated : t));
}

/** Restore the seed data. Called before every test. */
export function resetDb(): void {
  tickets = generate();
}
