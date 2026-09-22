import { createRule } from '~/helpers'
import { checkDates } from './checkDates'

/**
 * Validates that the date is after a given date.
 */
export const after = createRule(
  'after',
  (value, ruleContext) =>
    checkDates(value, ruleContext, (date, otherDate) =>
      date.isAfter(otherDate)
    ),
  {
    params: ['date$'],
  }
)
