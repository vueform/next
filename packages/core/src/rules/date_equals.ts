import { createRule } from '#src/helpers'

/**
 * Validates that the value equals a specific date string.
 *
 * @category Date
 * @param date The date string the value must equal.
 * @related date_format, after, before
 */
export const date_equals = createRule(
  'date_equals',
  (value, { params }) => value === params.date,
  {
    params: ['date'],
  }
)
