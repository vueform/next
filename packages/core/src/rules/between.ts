import { createRule } from '#src/helpers'

/**
 * Validates that the value's size is between a minimum and maximum (inclusive).
 *
 * @category Size
 * @param min The minimum size.
 * @param max The maximum size.
 * @related min, max, size
 */
export const between = createRule(
  'between',
  (value, { size, params }) => {
    const s = size(value)
    return (
      s === undefined || (s >= Number(params.min) && s <= Number(params.max))
    )
  },
  {
    params: ['min', 'max'],
    typed: true,
  }
)
