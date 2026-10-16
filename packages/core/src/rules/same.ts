import { createRule } from '#src/helpers'

/**
 * Validates that the value is the same as another field's value.
 *
 * @category Cross-field
 * @param other The path of the element to compare against — see
 *   [Element Reference Parameters](/guide/validation#element-reference-parameters).
 * @related different, confirmed
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
