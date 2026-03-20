import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      // istanbul instruments at transform time, avoiding v8's multi-worker merge
      // issues where shared modules are loaded by multiple test files.
      provider: 'istanbul',
      include: ['lib/**/*.js'],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
});
