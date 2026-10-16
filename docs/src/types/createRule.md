```ts
/**
 * Creates a callable validation rule with typed parameters, debounce support,
 * and automatic error messages. Calling the result with parameters returns a
 * configured copy.
 *
 * @param name The unique rule name used for lookup and message resolution.
 * @param check The validation function that returns `true`, `false`, or an
 *   error string.
 * @param options Optional configuration for params, debounce, typed messages,
 *   deps, and message overrides.
 */
function createRule<const T extends readonly string[] | true = []>(
  name: string,
  check: RuleChecker<T>,
  options?: RuleOptions<T>
): RuleDefinition<T>
```
