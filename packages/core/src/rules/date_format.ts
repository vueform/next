import { useDate } from '#src/composables'
import { createRule } from '#src/helpers'

/**
 * Validates that the value matches a specific date format.
 *
 * @category Date
 * @param format The date format the value must match.
 * @related date, date_equals
 */
export const date_format = createRule(
  'date_format',
  (value, { params, vueform }) =>
    value &&
    useDate(value, params.format, vueform).format(params.format) === value,
  {
    params: ['format'],
  }
)
