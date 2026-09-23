import { defineProject } from 'vitest/config'
import base, { baseTest } from '../vitest.base'

export default defineProject({
  ...base,
  test: {
    ...baseTest,
    name: 'security',
    include: ['./*.test.ts'],
  },
})
