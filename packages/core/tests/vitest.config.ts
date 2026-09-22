import { defineConfig } from 'vitest/config'
import { createBaseConfig } from '../vitest.config'

export default defineConfig(({ mode }) => ({
  ...createBaseConfig(mode),
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/vitest.setup.js'],
    include: [
      './tests/components/*.test.ts',
      './tests/features/*.test.ts',
      './tests/model/*.test.ts',
      './tests/rules/*.test.ts',
      './tests/security/*.test.ts',
      './tests/ssr/*.test.ts',
    ],
  },
}))
