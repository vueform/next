import { createRule } from '~/helpers'
import { isFile } from '~/utils'

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
