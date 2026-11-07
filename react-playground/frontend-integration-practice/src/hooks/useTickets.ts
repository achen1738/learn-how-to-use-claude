import { useCallback, useEffect, useState } from "react";
import { fetchTickets } from "../api/client";
import type { Page, Ticket, TicketQuery } from "../api/types";

export interface UseTicketsResult {
  /** The most recent page received. Kept while a new page loads, so the table doesn't flash. */
  data: Page<Ticket> | null;
  isLoading: boolean;
  error: Error | null;
  /** Re-run the current query. */
  refetch: () => void;
}

export function useTickets(params: TicketQuery): UseTicketsResult {
  const [data, setData] = useState<Page<Ticket> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  const { query, status, priority, page, pageSize } = params;

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    const controller = new AbortController();
    fetchTickets({ query, status, priority, page, pageSize }, { signal: controller.signal })
      .then((result) => {
        if (controller.signal.aborted) return;
        setIsLoading(false);
        setData(result);
      })
      .catch((err: Error) => {
        if (controller.signal.aborted) return;
        setIsLoading(false);
        setError(err);
      })
      .finally(() => setIsLoading(false));

    return () => {
      controller.abort();
    };
  }, [query, status, priority, page, pageSize, reloadCount]);

  const refetch = useCallback(() => setReloadCount((n) => n + 1), []);

  return { data, isLoading, error, refetch };
}
