import { createRule } from '#core/helpers'
import { isJson } from '#core/utils'

/**
 * Validates that the value is a valid JSON string.
 */
export const json = createRule('json', (value) => isJson(value))
