import { defineConfig } from 'vitest/config'
import base, { baseTest } from './vitest.base'

export default defineConfig({
  ...base,
  test: {
    ...baseTest,
    projects: [
      './tests/integration/vitest.config.ts',
      './tests/security/vitest.config.ts',
      './tests/env/ssr/vitest.config.ts',
      './tests/env/vapor/vitest.config.ts',
    ],
  },
})
