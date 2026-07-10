import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./api/tests/setup.ts'],
    // テストは順番に実行（DB競合防止）
    singleFork: true,
    testTimeout: 30000,
  },
})
