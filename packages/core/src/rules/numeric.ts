import { createRule } from '#core/helpers'

/**
 * Validates that the value is numeric.
 */
export const numeric = createRule(
  'numeric',
  (value) =>
    !isNaN(parseFloat(value)) &&
    isFinite(value) &&
    !/\s/.test(String(value)) &&
    !String(value).match(/^0x[0-9a-f]+$/i)
)
