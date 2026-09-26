import { createRule } from '#core/helpers'
import { isFile } from '#core/utils'

/**
 * Validates that the file is an image (jpg, jpeg, png, gif, bmp, svg, webp).
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
