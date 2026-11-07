import { defineConfig } from 'vitest/config';
import viteConfig from './vite.config';

// Runs the acceptance suite in /acceptance. These tests check the spec from
// the outside (labels, text, URL), so they don't care how you structure code.
export default defineConfig({
  ...viteConfig,
  test: {
    ...viteConfig.test,
    include: ['acceptance/**/*.test.{ts,tsx}'],
    testTimeout: 15000,
  },
});
