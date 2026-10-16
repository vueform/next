import { createRule } from '#src/helpers'
import { isFile } from '#src/utils'

/**
 * Validates that the file has an allowed MIME type.
 *
 * @category File
 * @param ...types The allowed MIME types, as a comma-separated list.
 * @related mimes, file, image
 */
export const mimetypes = createRule(
  'mimetypes',
  (value, { type, params }) =>
    type === 'file' &&
    (!value ||
      (isFile(value) &&
        params.map((p) => p.toLowerCase()).includes(value.type.toLowerCase()))),
  {
    params: true,
  }
)
