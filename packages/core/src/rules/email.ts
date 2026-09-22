import { createRule } from '~/helpers'

/**
 * Validates that the value is a valid email address.
 */
export const email = createRule('email', (value) => {
  if (typeof value === 'string' && value.length > 320) return false

  return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    String(value).toLowerCase()
  )
})
