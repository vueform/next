import { createRule } from '#src/helpers'

/**
 * Validates that the value is a valid IANA timezone identifier.
 *
 * @category String Format
 * @related in
 */
export const timezone = createRule('timezone', (value) => {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: value })
    return true
  } catch {
    return false
  }
})
