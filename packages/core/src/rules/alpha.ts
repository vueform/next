import { createRule } from '#src/helpers'

/**
 * Validates that the value contains only alphabetic characters.
 */
export const alpha = createRule('alpha', (value) => /^\p{L}+$/u.test(value))
