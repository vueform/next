import { createRule } from '@core/helpers'

/**
 * Validates that the value is included in a given list.
 */
export const in_ = createRule(
  'in_',
  (value, { params }) => params.includes(value),
  {
    params: true,
    message: 'rule_not_in_error',
  }
)
