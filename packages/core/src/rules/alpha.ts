import { createRule } from '~/helpers'

/**
 * Validates that the value contains only alphabetic characters.
 */
export const alpha = createRule('alpha', (value) => /^\p{L}+$/u.test(value))
