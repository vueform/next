import { checkDates } from './checkDates'
import { createRule } from '#core/helpers'

/**
 * Validates that the date is after or equal to a given date.
 */
export const after_or_equal = createRule(
  'after_or_equal',
  (value, ruleContext) =>
    checkDates(value, ruleContext, (date, otherDate) =>
      date.isSameOrAfter(otherDate)
    ),
  {
    params: ['date$'],
  }
)
