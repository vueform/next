import { createRule } from '#src/helpers'

/**
 * Validates that the value contains only alphanumeric characters.
 */
export const alpha_num = createRule('alpha_num', (value) =>
  /^[\p{L}\d]+$/u.test(value)
)
