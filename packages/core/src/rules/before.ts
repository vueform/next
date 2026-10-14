import { createRule } from '#src/helpers'
import { checkDates } from '#src/utils/dates'

/**
 * Validates that the date is before a given date.
 */
export const before = createRule(
  'before',
  (value, ruleContext) =>
    checkDates(value, ruleContext, (date, otherDate) =>
      date.isBefore(otherDate)
    ),
  {
    params: ['date$'],
  }
)
