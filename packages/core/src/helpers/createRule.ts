import type {
  RuleAttribute,
  RuleChecker,
  RuleOptions,
  RuleDefinition,
} from '#src/modules/validation'
import { RULE_BRAND } from '#src/modules/validation/symbols'
import { isPlainObject } from '#src/utils'

/**
 * Normalizes call arguments into rule attributes: a single object argument
 * becomes named attributes (unless the rule declares raw params), everything
 * else stays positional.
 *
 * @param args The arguments the rule was called with.
 * @param params The rule's declared params (`true` for raw passthrough).
 */
function buildAttributes(
  args: any[],
  params?: readonly string[] | true
): RuleAttribute[] {
  if (args.length === 1 && params !== true && isPlainObject(args[0])) {
    return Object.entries(args[0]).map(([name, value]) => ({
      name,
      value: value as any,
    }))
  }
  return args.map((value) => ({ value }))
}

/**
 * Stamps the brand and descriptor data onto a rule callable.
 *
 * @param target The callable to brand.
 * @param name The rule name.
 * @param check The validation function.
 * @param options The rule's options.
 * @param attributes The configured attributes.
 * @param conditions The configured conditions.
 * @param debounce The configured debounce delay.
 */
function brandRule(
  target: (...args: any[]) => RuleDefinition,
  name: string,
  check: RuleChecker<any>,
  options: RuleOptions<any> | undefined,
  attributes: RuleAttribute[],
  conditions: RuleDefinition['conditions'],
  debounce: number
): RuleDefinition {
  const branded = target as RuleDefinition
  Object.defineProperties(branded, {
    [RULE_BRAND]: { value: true },
    name: { value: name, enumerable: true },
    options: { value: options, enumerable: true },
    attributes: { value: attributes, enumerable: true },
    conditions: { value: conditions, enumerable: true },
    debounce: { value: debounce, enumerable: true },
    check: { value: check, enumerable: true },
  })
  return branded
}

/**
 * Creates a callable validation rule with typed parameters, debounce support,
 * and automatic error messages. The result is a stateless `RuleDefinition`:
 * calling it with parameters (`min(3)`, `min({ min: 3 })`) returns a configured
 * copy. The validation module compiles definitions into units and owns all
 * runtime state.
 *
 * Instance-independent by design: rules are authored at module scope, before
 * any `createVueform()` runs, so this produces plain descriptors and touches no
 * module, config or app.
 *
 * @param name The unique rule name used for lookup and message resolution.
 * @param check The validation function that returns `true`, `false`, or an
 *   error string.
 * @param options Optional configuration for params, debounce, typed messages,
 *   deps, and message overrides.
 */
export function createRule<const T extends readonly string[] | true = []>(
  name: string,
  check: RuleChecker<T>,
  options?: RuleOptions<T>
): RuleDefinition<T> {
  const make = (
    attributes: RuleAttribute[],
    conditions?: RuleDefinition['conditions'],
    debounce = options?.debounce ?? 0
  ): RuleDefinition<T> => {
    const rule = (...args: any[]): RuleDefinition<T> => {
      return make(buildAttributes(args, options?.params), conditions, debounce)
    }

    return brandRule(
      rule,
      name,
      check,
      options,
      attributes,
      conditions,
      debounce
    ) as RuleDefinition<T>
  }

  return make([])
}
