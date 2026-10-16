import { createRule } from '#src/helpers'
import { checkDates } from '#src/utils/dates'

/**
 * Validates that the date is after or equal to a given date.
 *
 * @category Date
 * @param date A date string, the keywords `today`, `tomorrow`, `yesterday`, or another
 *   element's path — see
 *   [Element Reference Parameters](/guide/validation#element-reference-parameters).
 * @related after, before, before_or_equal
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
