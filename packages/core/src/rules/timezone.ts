import { createRule } from '~/helpers'

/**
 * Validates that the value is a valid IANA timezone identifier.
 */
export const timezone = createRule('timezone', (value) => {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: value })
    return true
  } catch {
    return false
  }
})
