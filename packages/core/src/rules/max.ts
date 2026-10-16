import { createRule } from '#src/helpers'

/**
 * Validates that the value's size does not exceed a maximum.
 *
 * @category Size
 * @param max The maximum size.
 * @related min, between, size
 */
export const max = createRule(
  'max',
  (value, { size, params }) => {
    const s = size(value)
    return s === undefined || s <= Number(params.max)
  },
  {
    params: ['max'],
    typed: true,
  }
)
