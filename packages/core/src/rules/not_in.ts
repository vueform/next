import { createRule } from '~/helpers'

/**
 * Validates that the value is not included in a given list.
 */
export const not_in = createRule(
  'not_in',
  (value, { params }) => !params.includes(value),
  {
    params: true,
  }
)
