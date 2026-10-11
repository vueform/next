import { createRule } from '#src/helpers'

/**
 * Validates that the value equals a specific date string.
 */
export const date_equals = createRule(
  'date_equals',
  (value, { params }) => value === params.date,
  {
    params: ['date'],
  }
)
