import { createRule } from '#src/helpers'

/**
 * Validates that the value's size is at least a minimum.
 *
 * @category Size
 * @param min The minimum size.
 * @related max, between, size
 */
export const min = createRule(
  'min',
  (value, { size, params }) => {
    const s = size(value)
    return s === undefined || s >= Number(params.min)
  },
  {
    params: ['min'],
    typed: true,
  }
)
