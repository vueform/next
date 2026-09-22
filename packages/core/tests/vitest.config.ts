import { defineConfig } from 'vitest/config'
import base, { baseTest } from './vitest.base'

export default defineConfig({
  ...base,
  test: {
    ...baseTest,
    projects: [
      {
        extends: true,
        test: {
          name: 'main',
          include: [
            './tests/integration/**/*.test.ts',
            './tests/security/*.test.ts',
          ],
        },
      },
      {
        extends: true,
        test: {
          name: 'ssr',
          environment: 'node',
          include: ['./tests/env/ssr/*.test.ts'],
        },
      },
      './tests/env/vapor/vitest.config.ts',
    ],
  },
})
