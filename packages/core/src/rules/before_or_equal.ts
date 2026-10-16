import { createRule } from '#src/helpers'
import { checkDates } from '#src/utils/dates'

/**
 * Validates that the date is before or equal to a given date.
 *
 * @category Date
 * @param date A date string, the keywords `today`, `tomorrow`, `yesterday`, or another
 *   element's path — see
 *   [Element Reference Parameters](/guide/validation#element-reference-parameters).
 * @related before, after, after_or_equal
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
