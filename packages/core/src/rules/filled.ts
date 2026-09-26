import { createRule } from '#core/helpers'

/**
 * Validates that the field is not empty when present.
 */
export const filled = createRule('filled', (value, { el$ }) =>
  el$.filled(value)
)
