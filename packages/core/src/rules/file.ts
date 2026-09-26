import { createRule } from '#core/helpers'
import { isFile } from '#core/utils'

/**
 * Validates that the value is a file.
 */
export const file = createRule(
  'file',
  (value, { type }) => type === 'file' && (!value || isFile(value))
)
