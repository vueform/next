import { createRule } from '~/helpers'
import { isJson } from '~/utils'

/**
 * Validates that the value is a valid JSON string.
 */
export const json = createRule('json', (value) => isJson(value))
