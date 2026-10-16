import { createRule } from '#src/helpers'
import { isJson } from '#src/utils'

/**
 * Validates that the value is a valid JSON string.
 *
 * @category String Format
 * @related string
 */
export const json = createRule('json', (value) => isJson(value))
