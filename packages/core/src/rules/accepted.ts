import { createRule } from '@core/helpers'

/**
 * Validates that the value is accepted (truthy: yes, on, 1, true).
 *
 * @skipTypeExport
 */
export const accepted = createRule('accepted', (value) =>
  ['yes', 'on', '1', 1, true, 'true'].includes(value)
)
