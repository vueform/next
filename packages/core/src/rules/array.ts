import { createRule } from '#src/helpers'

/**
 * Validates that the value is an array.
 *
 * @category Type
 * @related distinct, in_array
 */
export const array = createRule('array', (value) => Array.isArray(value))
