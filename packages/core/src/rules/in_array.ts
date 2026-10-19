import { createRule } from '#src/helpers'

/**
 * Validates that the value exists in another field's array value.
 *
 * @category Cross-field
 * @param other The path of the element to compare against — see
 *   [Element Reference Parameters](/guide/validation#element-reference-parameters).
 * @related in, distinct
 */
export const in_array = createRule(
  'in_array',
  (value, { params }) => {
    const other = params.path$?.value
    return Array.isArray(other) && other.includes(value)
  },
  {
    transformParams: ({ params }) => ({
      path$:
        typeof params.path$ === 'string'
          ? params.path$.replace(/\.\*$/, '')
          : params.path$,
    }),
    params: ['path$'],
  }
)
