import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useTicketFilters } from './useTicketFilters';

describe('useTicketFilters', () => {
  it('parses and validates values from the URL', () => {
    window.history.replaceState(null, '', '/?q=sso&status=bogus&priority=high&page=-3');
    const { result } = renderHook(() => useTicketFilters());
    expect(result.current.filters).toEqual({
      search: 'sso',
      status: '',
      priority: 'high',
      page: 1,
    });
  });

  it('resets to page 1 when search or a filter changes', () => {
    const { result } = renderHook(() => useTicketFilters());

    act(() => result.current.setPage(3));
    expect(result.current.filters.page).toBe(3);

    act(() => result.current.setStatus('open'));
    expect(result.current.filters).toMatchObject({ status: 'open', page: 1 });

    act(() => result.current.setPage(2));
    act(() => result.current.setSearch('refund'));
    expect(result.current.filters).toMatchObject({ search: 'refund', page: 1 });
  });

  it('keeps the URL in sync', () => {
    const { result } = renderHook(() => useTicketFilters());
    act(() => result.current.setPriority('urgent'));
    act(() => result.current.setPage(2));
    expect(window.location.search).toBe('?priority=urgent&page=2');
  });
});
