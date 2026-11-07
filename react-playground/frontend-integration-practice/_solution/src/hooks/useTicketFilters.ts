import { useCallback, useMemo } from 'react';
import type { TicketPriority, TicketStatus } from '../api/types';
import { isTicketPriority, isTicketStatus } from '../constants';
import { useUrlState } from './useUrlState';

export interface TicketFilters {
  search: string;
  status: TicketStatus | '';
  priority: TicketPriority | '';
  page: number;
}

// URL keys come from the spec: ?q=&status=&priority=&page=
const URL_DEFAULTS = { q: '', status: '', priority: '', page: '1' };

function parsePage(raw: string): number {
  const page = Number(raw);
  return Number.isInteger(page) && page >= 1 ? page : 1;
}

/**
 * The inbox's search/filter/page state, stored in the URL.
 * Changing search or a filter always resets to page 1.
 */
export function useTicketFilters() {
  const [raw, setRaw] = useUrlState(URL_DEFAULTS);

  const filters = useMemo<TicketFilters>(
    () => ({
      search: raw.q,
      status: isTicketStatus(raw.status) ? raw.status : '',
      priority: isTicketPriority(raw.priority) ? raw.priority : '',
      page: parsePage(raw.page),
    }),
    [raw],
  );

  const setSearch = useCallback((q: string) => setRaw({ q, page: '1' }), [setRaw]);
  const setStatus = useCallback((status: TicketStatus | '') => setRaw({ status, page: '1' }), [setRaw]);
  const setPriority = useCallback(
    (priority: TicketPriority | '') => setRaw({ priority, page: '1' }),
    [setRaw],
  );
  const setPage = useCallback((page: number) => setRaw({ page: String(page) }), [setRaw]);

  return { filters, setSearch, setStatus, setPriority, setPage };
}
