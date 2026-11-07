import { useCallback, useEffect, useState } from 'react';
import { fetchTickets } from '../api/client';
import type { Page, Ticket, TicketQuery } from '../api/types';

export interface UseTicketsResult {
  /** The most recent page received. Kept while a new page loads, so the table doesn't flash. */
  data: Page<Ticket> | null;
  isLoading: boolean;
  error: Error | null;
  /** Re-run the current query. */
  refetch: () => void;
  /** Change one ticket in the loaded page without refetching (for optimistic updates). */
  updateTicketLocally: (id: string, update: (ticket: Ticket) => Ticket) => void;
}

export function useTickets(params: TicketQuery): UseTicketsResult {
  const [data, setData] = useState<Page<Ticket> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  const { query, status, priority, page, pageSize } = params;

  useEffect(() => {
    // BUG-102 fix: cancel the previous request when the query changes, so a
    // slow, older response can never overwrite a newer one.
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    fetchTickets({ query, status, priority, page, pageSize }, { signal: controller.signal })
      .then((result) => {
        if (controller.signal.aborted) return;
        setData(result);
        setIsLoading(false);
      })
      .catch((err: Error) => {
        if (controller.signal.aborted) return; // superseded, not a real failure
        setError(err);
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [query, status, priority, page, pageSize, reloadCount]);

  const refetch = useCallback(() => setReloadCount((n) => n + 1), []);

  const updateTicketLocally = useCallback(
    (id: string, update: (ticket: Ticket) => Ticket) => {
      setData((prev) =>
        prev && { ...prev, items: prev.items.map((t) => (t.id === id ? update(t) : t)) },
      );
    },
    [],
  );

  return { data, isLoading, error, refetch, updateTicketLocally };
}
