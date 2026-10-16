import { createRule } from '#src/helpers'

/**
 * Validates that the value matches a corresponding `_confirmed` field.
 *
 * @category Cross-field
 * @related same
 */
export const confirmed = createRule(
  'confirmed',
  (value, { el$, getOther$ }) => value === getOther$(`${el$.path}_confirmed`)
)
