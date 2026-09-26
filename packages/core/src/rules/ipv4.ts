import { createRule } from '#core/helpers'

export const ipv4regex =
  /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\/([0-9]|[1-2][0-9]|3[0-2]))?$/

/**
 * Validates that the value is a valid IPv4 address.
 */
export const ipv4 = createRule('ipv4', (value) => ipv4regex.test(value))
