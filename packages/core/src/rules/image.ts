import { createRule } from '#src/helpers'
import { isFile } from '#src/utils'

/**
 * Validates that the file is an image (jpg, jpeg, png, gif, bmp, svg, webp).
 *
 * @category File
 * @related file, dimensions, mimes
 */
export const image = createRule(
  'image',
  (value, { type }) =>
    type === 'file' &&
    (!value ||
      (isFile(value) &&
        ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(
          value.name.split('.').at(-1).toLowerCase()
        )))
)
