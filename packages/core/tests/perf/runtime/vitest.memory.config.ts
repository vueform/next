import { defineConfig } from 'vitest/config'
import base, { baseTest } from '../../vitest.base'

export default defineConfig({
  ...base,
  test: {
    ...baseTest,
    include: ['./tests/perf/**/*.mem.ts'],
    fileParallelism: false,
    isolate: false,
    maxWorkers: 1,
    testTimeout: 120_000,
    hookTimeout: 120_000,
    pool: 'forks',
    poolOptions: {
      forks: { execArgv: ['--expose-gc'] },
    },
  },
})
