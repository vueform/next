import { defineConfig } from 'vitest/config'
import base, { baseTest } from '../../vitest.base'

export default defineConfig({
  ...base,
  test: {
    ...baseTest,
    include: [],
    fileParallelism: false,
    maxWorkers: 1,
    testTimeout: 60_000,
    hookTimeout: 60_000,
    benchmark: {
      include: ['./tests/perf/**/*.bench.ts'],
      reporters: ['verbose'],
    },
  },
})
