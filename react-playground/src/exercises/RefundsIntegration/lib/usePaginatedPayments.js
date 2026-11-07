import { useCallback, useEffect, useRef, useState } from "react";
import { listPayments } from "./api.js";

/**
 * Loads payments page by page for a status filter. Documented in DOCS.md.
 *
 * Returns { payments, loading, error, hasMore, loadMore, reload, updatePayment }.
 */
export function usePaginatedPayments({ status = "all", pageSize = 20 } = {}) {
  const [state, setState] = useState({ payments: [], nextCursor: null, loading: true, error: null });
  const latestRequest = useRef(0);

  const load = useCallback(
    async (cursor, replace) => {
      const requestId = ++latestRequest.current;
      setState((s) => ({ ...s, loading: true, error: null, payments: replace ? [] : s.payments }));
      try {
        const page = await listPayments({ status, cursor, limit: pageSize });
        if (requestId !== latestRequest.current) return; // a newer request superseded this one
        setState((s) => ({
          payments: replace ? page.data : [...s.payments, ...page.data],
          nextCursor: page.nextCursor,
          loading: false,
          error: null,
        }));
      } catch (error) {
        if (requestId !== latestRequest.current) return;
        setState((s) => ({ ...s, loading: false, error }));
      }
    },
    [status, pageSize],
  );

  useEffect(() => {
    load(null, true);
  }, [load]);

  const { nextCursor, loading } = state;

  const loadMore = useCallback(() => {
    if (nextCursor && !loading) load(nextCursor, false);
  }, [load, nextCursor, loading]);

  const reload = useCallback(() => load(null, true), [load]);

  /** Replaces one loaded payment: updatePayment(id, (payment) => newPayment). No request is made. */
  const updatePayment = useCallback((id, updater) => {
    setState((s) => ({ ...s, payments: s.payments.map((p) => (p.id === id ? updater(p) : p)) }));
  }, []);

  return {
    payments: state.payments,
    loading: state.loading,
    error: state.error,
    hasMore: state.nextCursor !== null,
    loadMore,
    reload,
    updatePayment,
  };
}
