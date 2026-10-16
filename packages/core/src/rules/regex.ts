import { createRule } from '#src/helpers'
import { stringToRegex, warn, isDev } from '#src/utils'

/**
 * Compiles the rule's pattern param, failing closed: a value must never pass
 * (or, for `not_regex`, fail) validation because the developer's pattern was
 * malformed or missing — and the **value** is never used as the pattern.
 *
 * @param pattern The `/pattern/flags` string from the rule definition.
 */
export function compileRulePattern(pattern: unknown): RegExp | undefined {
  if (typeof pattern !== 'string' || !/^\/.+\/[a-z]*$/i.test(pattern)) {
    if (isDev()) {
      warn(
        `the \`regex\` rule needs a \`/pattern/flags\` param (got \`${String(pattern)}\`); the rule fails closed.`
      )
    }
    return undefined
  }

  try {
    return stringToRegex(pattern)
  } catch {
    if (isDev()) {
      warn(
        `the \`regex\` rule pattern \`${pattern}\` does not compile; the rule fails closed.`
      )
    }
    return undefined
  }
}

/**
 * Validates that the value matches a given regular expression.
 *
 * @category Pattern
 * @param pattern The regular expression in `/pattern/flags` form.
 * @related not_regex
 */
export const regex = createRule(
  'regex',
  (value, { params }) => {
    const re = compileRulePattern(params.pattern)
    return re ? re.test(String(value)) : false
  },
  {
    params: ['pattern'],
  }
)
