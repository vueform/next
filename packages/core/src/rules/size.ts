import { createRule } from '#src/helpers'

/**
 * Validates that the value's size exactly equals a given value.
 *
 * @category Size
 * @param size The exact size.
 * @related min, max, between, digits
 */
export const size = createRule(
  'size',
  (value, { size, params }) => {
    const s = size(value)
    return s === undefined || s === Number(params.size)
  },
  {
    params: ['size'],
    typed: true,
  }
)
