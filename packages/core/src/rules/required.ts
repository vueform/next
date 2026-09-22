import { createRule } from '~/helpers'

/**
 * Validates that the field has a non-empty value.
 */
export const required = createRule('required', (value, { el$ }) =>
  el$.filled(value)
)
