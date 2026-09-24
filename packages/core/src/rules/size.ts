import { createRule } from '@core/helpers'

/**
 * Validates that the value's size exactly equals a given value.
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
