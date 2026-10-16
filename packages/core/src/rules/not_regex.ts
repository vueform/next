import { createRule } from '#src/helpers'

import { compileRulePattern } from './regex'

/**
 * Validates that the value does not match a given regular expression.
 *
 * @category Pattern
 * @param pattern The regular expression in `/pattern/flags` form.
 * @related regex
 */
export const not_regex = createRule(
  'not_regex',
  (value, { params }) => {
    const re = compileRulePattern(params.pattern)
    return re ? !re.test(String(value)) : false
  },
  {
    params: ['pattern'],
  }
)
