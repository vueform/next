import { createRule } from '#src/helpers'

/**
 * Validates that the field has a non-empty value.
 *
 * @category Presence
 * @related filled, nullable, accepted
 */
export const required = createRule('required', (value, { el$ }) =>
  el$.filled(value)
)
