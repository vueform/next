import { createRule } from '@core/helpers'

/**
 * Validates that the value's size is at least a minimum.
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
