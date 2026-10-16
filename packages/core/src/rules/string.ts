import { createRule } from '#src/helpers'

/**
 * Validates that the value is a string.
 *
 * @category Type
 * @related numeric, alpha
 */
export const string = createRule('string', (value) => typeof value === 'string')
