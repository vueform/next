import { createRule } from '#src/helpers'

/**
 * Validates that the value contains only alphanumeric characters, dashes, and
 * underscores.
 *
 * @category String Format
 * @related alpha, alpha_num
 */
export const alpha_dash = createRule('alpha_dash', (value) =>
  /^[\p{L}\d\-_]+$/u.test(value)
)
