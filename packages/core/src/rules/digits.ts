import { createRule } from '#src/helpers'

/**
 * Validates that the value is numeric and has an exact number of digits.
 *
 * @category Size
 * @param digits The exact number of digits.
 * @related digits_between, numeric, integer
 */
export const digits = createRule(
  'digits',
  (value, { params }) =>
    /^\d+$/.test(value) && String(value).length === Number(params.digits),
  {
    params: ['digits'],
  }
)
