import { createRule } from '#src/helpers'

/**
 * Validates that the value's size is between a minimum and maximum (inclusive).
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
