import { createRule } from '#src/helpers'

/**
 * Validates that the value is a valid UUID.
 *
 * @category String Format
 * @related regex
 */
export const uuid = createRule('uuid', (value) =>
  /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(value)
)
