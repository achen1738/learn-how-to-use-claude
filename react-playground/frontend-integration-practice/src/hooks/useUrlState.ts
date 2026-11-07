import { useCallback, useEffect, useRef, useState } from 'react';

type StringRecord = Record<string, string>;

function readFromUrl<T extends StringRecord>(defaults: T): T {
  const params = new URLSearchParams(window.location.search);
  const result = { ...defaults };
  for (const key of Object.keys(defaults) as (keyof T & string)[]) {
    const value = params.get(key);
    if (value !== null) result[key] = value as T[typeof key];
  }
  return result;
}

function writeToUrl<T extends StringRecord>(state: T, defaults: T): void {
  const params = new URLSearchParams(window.location.search);
  for (const key of Object.keys(defaults)) {
    const value = state[key];
    if (value === '' || value === defaults[key]) params.delete(key);
    else params.set(key, value);
  }
  const search = params.toString();
  const url = `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`;
  if (url !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
    window.history.replaceState(window.history.state, '', url);
  }
}

/**
 * Like useState, but the state lives in the URL query string so it survives
 * reloads and can be shared as a link.
 *
 * - Only keys present in `defaults` are managed; other query params are left alone.
 * - Values are always strings. Parse/validate them yourself.
 * - Values equal to the default (or '') are removed from the URL to keep it clean.
 * - The setter merges a partial patch, like a class component's setState.
 */
export function useUrlState<T extends StringRecord>(
  defaults: T,
): [T, (patch: Partial<T>) => void] {
  const defaultsRef = useRef(defaults);
  const [state, setState] = useState<T>(() => readFromUrl(defaults));

  useEffect(() => {
    writeToUrl(state, defaultsRef.current);
  }, [state]);

  useEffect(() => {
    const onPopState = () => setState(readFromUrl(defaultsRef.current));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const update = useCallback((patch: Partial<T>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  return [state, update];
}
