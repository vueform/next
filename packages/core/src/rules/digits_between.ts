import { createRule } from '#src/helpers'

/**
 * Validates that the value is numeric with a digit count between a minimum and
 * maximum.
 *
 * @category Size
 * @param min The minimum number of digits.
 * @param max The maximum number of digits.
 * @related digits, between
 */
export const digits_between = createRule(
  'digits_between',
  (value, { params }) =>
    /^\d+$/.test(value) &&
    String(value).length >= Number(params.min) &&
    String(value).length <= Number(params.min),
  {
    params: ['min', 'max'],
  }
)
