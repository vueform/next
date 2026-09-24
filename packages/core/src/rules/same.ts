import { createRule } from '@core/helpers'

/**
 * Validates that the value is the same as another field's value.
 */
export const same = createRule(
  'same',
  (value, { params, form$ }) =>
    !params.path$ ||
    (!params.path$.validated && params.path$.empty && !form$?.submits) ||
    value == params.path$.value,
  {
    messageParams: ({ params }) => ({
      other: params.path$?.genericName,
    }),
    params: ['path$'],
  }
)
