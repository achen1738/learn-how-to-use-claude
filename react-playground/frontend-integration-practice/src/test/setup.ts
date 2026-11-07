import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';
import { apiConfig } from '../api/client';
import { resetDb } from '../api/mockDb';

beforeEach(() => {
  resetDb();
  apiConfig.reset();
  // Fast, predictable responses in tests. Call apiConfig.setLatency(null)
  // inside a test if you need realistic timing.
  apiConfig.setLatency(0);
  window.history.replaceState(null, '', '/');
});

afterEach(() => {
  cleanup();
});
