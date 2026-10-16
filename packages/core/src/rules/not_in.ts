import { createRule } from '#src/helpers'

/**
 * Validates that the value is not included in a given list.
 *
 * @category Membership
 * @param ...values The forbidden values, as a comma-separated list.
 * @related in
 */
export const not_in = createRule(
  'not_in',
  (value, { params }) => !params.includes(value),
  {
    params: true,
  }
)
