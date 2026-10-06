import { createRule } from '#core/helpers'

import { checkDates } from './checkDates'

/**
 * Validates that the date is before or equal to a given date.
 */
export const before_or_equal = createRule(
  'before_or_equal',
  (value, ruleContext) =>
    checkDates(value, ruleContext, (date, otherDate) =>
      date.isSameOrBefore(otherDate)
    ),
  {
    params: ['date$'],
  }
)
