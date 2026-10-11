import { createRule } from '#src/helpers'

/**
 * Validates that the value is different from another field's value.
 */
export const different = createRule(
  'different',
  (value, { params, form$ }) =>
    !params.path$ ||
    (!params.path$.validated && params.path$.empty && !form$?.submits) ||
    value != params.path$.value,
  {
    messageParams: ({ params }) => ({
      other: params.path$?.genericName,
    }),
    params: ['path$'],
  }
)
