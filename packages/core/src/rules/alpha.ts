import { createRule } from '#src/helpers'

/**
 * Validates that the value contains only alphabetic characters.
 *
 * @category String Format
 * @related alpha_num, alpha_dash
 */
export const alpha = createRule('alpha', (value) => /^\p{L}+$/u.test(value))
