import { defineConfig } from 'vitest/config'
import { createBaseConfig } from '../vitest.config'

export default defineConfig(({ mode }) => ({
  ...createBaseConfig(mode),
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/vitest.setup.js'],
    include: [
      './tests/integration/**/*.test.ts',
      './tests/security/*.test.ts',
      './tests/env/ssr/*.test.ts',
    ],
  },
}))
