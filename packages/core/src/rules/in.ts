import { createRule } from '#src/helpers'

/**
 * Validates that the value is included in a given list.
 *
 * @category Membership
 * @param ...values The allowed values, as a comma-separated list.
 * @related not_in, in_array
 */
export const in_ = createRule(
  'in_',
  (value, { params }) => params.includes(value),
  {
    params: true,
    message: 'rule_in_error',
  }
)
