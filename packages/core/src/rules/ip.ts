import { createRule } from '#src/helpers'

import { ipv4regex } from './ipv4'
import { ipv6regex } from './ipv6'

/**
 * Validates that the value is a valid IPv4 or IPv6 address.
 */
export const ip = createRule(
  'ip',
  (value) => ipv4regex.test(value) || ipv6regex.test(value)
)
