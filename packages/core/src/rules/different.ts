import { createRule } from '#src/helpers'

/**
 * Validates that the value is different from another field's value.
 *
 * @category Cross-field
 * @param other The path of the element to compare against — see
 *   [Element Reference Parameters](/guide/validation#element-reference-parameters).
 * @related same
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
