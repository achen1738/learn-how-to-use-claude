import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiConfig } from '../api/client';
import type { TicketQuery } from '../api/types';
import { useTickets } from './useTickets';

describe('useTickets', () => {
  it('loads a page of tickets', async () => {
    const { result } = renderHook(() => useTickets({ page: 1, pageSize: 10 }));
    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data?.items).toHaveLength(10);
  });

  it('exposes errors and recovers on refetch', async () => {
    apiConfig.failNextRequest();
    const { result } = renderHook(() => useTickets({ page: 1, pageSize: 10 }));
    await waitFor(() => expect(result.current.error).not.toBeNull());

    act(() => result.current.refetch());
    await waitFor(() => expect(result.current.data).not.toBeNull());
    expect(result.current.error).toBeNull();
  });

  it('updates one ticket locally', async () => {
    const { result } = renderHook(() => useTickets({ page: 1, pageSize: 10 }));
    await waitFor(() => expect(result.current.data).not.toBeNull());

    act(() => result.current.updateTicketLocally('T-0061', (t) => ({ ...t, assignee: 'Me' })));
    expect(result.current.data?.items[0].assignee).toBe('Me');
  });

  describe('with realistic latency', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      apiConfig.setLatency(null); // 1-2 char searches take 900ms, others 250ms
    });
    afterEach(() => vi.useRealTimers());

    it('ignores a slow, stale response that arrives after a newer one (BUG-102)', async () => {
      const { result, rerender } = renderHook((props: TicketQuery) => useTickets(props), {
        initialProps: { query: 'bi', page: 1, pageSize: 10 },
      });

      rerender({ query: 'billing', page: 1, pageSize: 10 });
      await act(() => vi.advanceTimersByTimeAsync(250)); // "billing" responds
      expect(result.current.data?.items.every((t) => /billing/i.test(t.subject))).toBe(true);

      await act(() => vi.advanceTimersByTimeAsync(1000)); // "bi" would respond now
      expect(result.current.data?.items.every((t) => /billing/i.test(t.subject))).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });
});
