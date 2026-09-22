import { defineConfig } from 'vitest/config'
import { createBaseConfig } from '../../vitest.config'

export default defineConfig(({ mode }) => ({
  ...createBaseConfig(mode),
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/vitest.setup.js'],
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
}))
