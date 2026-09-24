import { createRule } from '@core/helpers'

/**
 * Validates that the value is a string.
 */
export const string = createRule('string', (value) => typeof value === 'string')
