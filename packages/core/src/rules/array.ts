import { createRule } from '#core/helpers'

/**
 * Validates that the value is an array.
 */
export const array = createRule('array', (value) => Array.isArray(value))
