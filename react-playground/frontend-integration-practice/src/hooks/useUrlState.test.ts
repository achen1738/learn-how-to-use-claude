import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useUrlState } from './useUrlState';

const DEFAULTS = { q: '', sort: 'newest' };

describe('useUrlState', () => {
  it('uses defaults when the URL has no params', () => {
    const { result } = renderHook(() => useUrlState(DEFAULTS));
    expect(result.current[0]).toEqual({ q: '', sort: 'newest' });
  });

  it('reads initial state from the URL', () => {
    window.history.replaceState(null, '', '/?q=refund&sort=oldest');
    const { result } = renderHook(() => useUrlState(DEFAULTS));
    expect(result.current[0]).toEqual({ q: 'refund', sort: 'oldest' });
  });

  it('merges patches and writes them to the URL, omitting defaults', () => {
    const { result } = renderHook(() => useUrlState(DEFAULTS));

    act(() => result.current[1]({ q: 'refund' }));
    expect(result.current[0]).toEqual({ q: 'refund', sort: 'newest' });
    expect(window.location.search).toBe('?q=refund');

    act(() => result.current[1]({ q: '', sort: 'oldest' }));
    expect(window.location.search).toBe('?sort=oldest');
  });

  it('leaves query params it does not manage alone', () => {
    window.history.replaceState(null, '', '/?debug=1');
    const { result } = renderHook(() => useUrlState(DEFAULTS));
    act(() => result.current[1]({ q: 'sso' }));
    expect(new URLSearchParams(window.location.search).get('debug')).toBe('1');
  });
});
