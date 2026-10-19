import { createRule } from '#src/helpers'

// Named `in` (not the `in_` export identifier) so both usage styles — the
// `'in:...'` string and the imported definition — resolve the same message
// tag (`rule_in_error`) and stay overridable via `ruleMessages.in`.

/**
 * Validates that the value is included in a given list.
 *
 * @category Membership
 * @param ...values The allowed values, as a comma-separated list.
 * @related not_in, in_array
 */
export const in_ = createRule(
  'in',
  (value, { params }) => params.includes(value),
  {
    params: true,
  }
)
