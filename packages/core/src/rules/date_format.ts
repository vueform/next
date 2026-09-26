import { useDate } from '#core/composables'
import { createRule } from '#core/helpers'

/**
 * Validates that the value matches a specific date format.
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
