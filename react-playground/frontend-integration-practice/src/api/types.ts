
const allStatuses = ['open' , 'pending' , 'resolved' , 'closed'] as const;
const allPriorities = ['low' , 'medium' , 'high' , 'urgent'] as const;

export type TicketStatus = typeof allStatuses[number];
export type TicketPriority = typeof allPriorities[number];

export function isTicketStatus(value: string | null): value is TicketStatus  {
  if (!value) return false;
  return (allStatuses as readonly string[]).includes(value);
}

export function isTicketPriority(value: string | null): value is TicketPriority {
  if (!value) return false;
  return (allPriorities as readonly string[]).includes(value);
}


export interface Ticket {
  /** Human-readable id, e.g. "T-0042". */
  id: string;
  subject: string;
  customer: string;
  status: TicketStatus;
  priority: TicketPriority;
  /** Display name of the assigned agent, or null when unassigned. */
  assignee: string | null;
  /** ISO 8601 timestamp. */
  createdAt: string;
}

export interface TicketQuery {
  /** Free-text search over id, subject and customer (case-insensitive). */
  query?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  /** 1-based page number. */
  page: number;
  pageSize: number;
}

export interface Page<T> {
  items: T[];
  /** Total number of matching items across all pages. */
  total: number;
  page: number;
  pageSize: number;
}

export type TicketPatch = Partial<Pick<Ticket, 'assignee' | 'status' | 'priority'>>;
