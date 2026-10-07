import { createRule } from '#src/helpers'
import { equals } from '#src/utils'

/**
 * Validates that all items in an array are unique.
 */
export const distinct = createRule('distinct', (value) => {
  if (!Array.isArray(value)) return true

  for (let i = 0; i < value.length; i++) {
    for (let j = i + 1; j < value.length; j++) {
      if (equals(value[i], value[j])) return false
    }
  }

  return true
})
