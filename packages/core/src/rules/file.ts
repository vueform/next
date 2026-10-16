import { createRule } from '#src/helpers'
import { isFile } from '#src/utils'

/**
 * Validates that the value is a file.
 *
 * @category File
 * @related image, mimes, mimetypes
 */
export const file = createRule(
  'file',
  (value, { type }) => type === 'file' && (!value || isFile(value))
)
