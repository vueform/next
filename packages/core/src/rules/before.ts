import { createRule } from '#src/helpers'
import { checkDates } from '#src/utils/dates'

/**
 * Validates that the date is before a given date.
 *
 * @category Date
 * @param date A date string, the keywords `today`, `tomorrow`, `yesterday`, or another
 *   element's path — see
 *   [Element Reference Parameters](/guide/validation#element-reference-parameters).
 * @related before_or_equal, after, after_or_equal
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
