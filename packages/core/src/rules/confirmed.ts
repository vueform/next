import { createRule } from '@core/helpers'

/**
 * Validates that the value matches a corresponding `_confirmed` field.
 */
export const confirmed = createRule(
  'confirmed',
  (value, { el$, getOther$ }) => value === getOther$(`${el$.path}_confirmed`)
)
