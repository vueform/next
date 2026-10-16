import { createRule } from '#src/helpers'

/**
 * Validates that the field is not empty when present.
 *
 * @category Presence
 * @related required, nullable
 */
export const filled = createRule('filled', (value, { el$ }) =>
  el$.filled(value)
)
