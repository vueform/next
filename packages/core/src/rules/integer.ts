import { createRule } from '~/helpers'
import { normalize } from '~/utils'

/**
 * Validates that the value is an integer.
 */
export const integer = createRule('integer', (value) => {
  const normalized = normalize(String(value).trim())
  return normalized === parseInt(normalized, 10)
})
