import { createRule } from '#src/helpers'
import { isFile } from '#src/utils'

/**
 * Validates that the file has an allowed extension.
 */
export const mimes = createRule(
  'mimes',
  (value, { type, params }) =>
    type === 'file' &&
    (!value ||
      (isFile(value) &&
        params
          .map((p) => p.toLowerCase())
          .includes(value.name.split('.').at(-1).toLowerCase()))),
  {
    params: true,
  }
)
