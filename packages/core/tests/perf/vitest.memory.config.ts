import { defineConfig } from 'vitest/config'
import { createBaseConfig } from '../../vitest.config'

export default defineConfig(({ mode }) => ({
  ...createBaseConfig(mode),
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/vitest.setup.js'],
    include: ['./tests/perf/**/*.mem.ts'],
    fileParallelism: false,
    isolate: false,
    maxWorkers: 1,
    testTimeout: 120_000,
    hookTimeout: 120_000,
    pool: 'forks',
    execArgv: ['--expose-gc'],
  },
}))
