import { createRule } from '@core/helpers'

/**
 * Validates that the value's size is less than or equal to another field's
 * size.
 */
export const lte = createRule(
  'lte',
  (value, { params, size, form$ }) => {
    if (!params.path$) return true
    if (!params.path$.validated && params.path$.empty && !form$?.submits) {
      return true
    }

    const sizeA = size(value)
    const sizeB = size(params.path$.value, params.path$)

    return sizeA === undefined || sizeB === undefined || sizeA <= sizeB
  },
  {
    params: ['path$'],
    typed: true,
    messageParams: ({ params, size }) => {
      const s = params.path$
        ? size(params.path$.value, params.path$)
        : undefined
      return {
        value: s === undefined ? 0 : s,
      }
    },
  }
)
