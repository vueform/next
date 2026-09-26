import { createRule } from '#core/helpers'

/**
 * Validates that the value is numeric and has an exact number of digits.
 */
export const digits = createRule(
  'digits',
  (value, { params }) =>
    /^\d+$/.test(value) && String(value).length === Number(params.digits),
  {
    params: ['digits'],
  }
)
