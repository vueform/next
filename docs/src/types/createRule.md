```ts
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
function createRule<const T extends readonly string[] | true = []>(
  name: string,
  check: RuleChecker<T>,
  options?: RuleOptions<T>
): RuleDefinition<T>
```
