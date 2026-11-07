import { getAllTickets, saveTicket } from './mockDb';
import type { Page, Ticket, TicketPatch, TicketQuery } from './types';

// Fake HTTP client for the tickets service. It behaves like a real network
// API: responses are async, take time, can fail and can be aborted.
// See docs/API.md. Treat this file as owned by another team: use it, don't change it.

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export interface RequestOptions {
  signal?: AbortSignal;
}

interface ApiConfig {
  latencyMs: number | null;
  failNext: boolean;
}

const DEFAULT_CONFIG: ApiConfig = { latencyMs: null, failNext: false };
let config: ApiConfig = { ...DEFAULT_CONFIG };

/** Test/dev controls for the fake API. */
export const apiConfig = {
  /** Make every request take exactly `ms`. Pass null to restore realistic latency. */
  setLatency(ms: number | null) {
    config.latencyMs = ms;
  },
  /** Make the next request (fetch or update) fail with a 500. */
  failNextRequest() {
    config.failNext = true;
  },
  reset() {
    config = { ...DEFAULT_CONFIG };
  },
};

function abortError() {
  return new DOMException('The request was aborted.', 'AbortError');
}

function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError());
      return;
    }
    const onAbort = () => {
      clearTimeout(timer);
      reject(abortError());
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

function takeScheduledFailure(): boolean {
  const shouldFail = config.failNext;
  config.failNext = false;
  return shouldFail;
}

// Broad searches scan more of the index, so they are slower.
function searchLatency(query: string | undefined): number {
  const length = (query ?? '').trim().length;
  return length > 0 && length <= 2 ? 900 : 250;
}

function matches(ticket: Ticket, params: TicketQuery): boolean {
  if (params.status && ticket.status !== params.status) return false;
  if (params.priority && ticket.priority !== params.priority) return false;
  const q = params.query?.trim().toLowerCase();
  if (q) {
    const haystack = `${ticket.id} ${ticket.subject} ${ticket.customer}`.toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  return true;
}

/**
 * GET /tickets
 * Returns one page of tickets matching the filters, newest first.
 */
export async function fetchTickets(
  params: TicketQuery,
  options: RequestOptions = {},
): Promise<Page<Ticket>> {
  const shouldFail = takeScheduledFailure();
  await wait(config.latencyMs ?? searchLatency(params.query), options.signal);
  if (shouldFail) throw new ApiError('Internal server error', 500);

  if (!Number.isInteger(params.page) || params.page < 1) {
    throw new ApiError(`Invalid page: ${params.page}`, 400);
  }

  const matching = getAllTickets()
    .filter((t) => matches(t, params))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const start = (params.page - 1) * params.pageSize;
  return {
    items: matching.slice(start, start + params.pageSize).map((t) => ({ ...t })),
    total: matching.length,
    page: params.page,
    pageSize: params.pageSize,
  };
}

/**
 * PATCH /tickets/:id
 * Updates a ticket and returns the saved version.
 */
export async function updateTicket(
  id: string,
  patch: TicketPatch,
  options: RequestOptions = {},
): Promise<Ticket> {
  const shouldFail = takeScheduledFailure();
  await wait(config.latencyMs ?? 400, options.signal);
  if (shouldFail) throw new ApiError('Internal server error', 500);

  const existing = getAllTickets().find((t) => t.id === id);
  if (!existing) throw new ApiError(`Ticket ${id} not found`, 404);

  // Simulated edit conflict: another agent changed the ticket first.
  if (Number(id.slice(2)) % 7 === 0) {
    throw new ApiError(`Ticket ${id} was modified by another agent`, 409);
  }

  const updated = { ...existing, ...patch };
  saveTicket(updated);
  return { ...updated };
}
