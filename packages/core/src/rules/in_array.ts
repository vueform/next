import { createRule } from '~/helpers'

/**
 * Validates that the value exists in another field's array value.
 */
export const in_array = createRule(
  'in_array',
  (value, { params }) => {
    const other = params.path$?.value
    return Array.isArray(other) && other.includes(value)
  },
  {
    transformParams: ({ params }) => ({
      path$: params.path$.replace(/\.\*$/, ''),
    }),
    params: ['path$'],
  }
)
