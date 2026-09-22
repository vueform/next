import { createRule } from '~/helpers'

/**
 * Validates that the value is a boolean-like value (true, false, 0, 1, '0',
 * '1').
 */
export const boolean = createRule('boolean', (value) =>
  [true, false, 0, 1, '0', '1'].includes(value)
)
