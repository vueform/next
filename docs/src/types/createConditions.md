```ts
/**
 * Creates a conditions instance. Date comparisons resolve their adapter via the
 * config's date module and expression conditions resolve through the config's
 * expression module.
 *
 * @param vueform The owning instance (uses `$conditions.strict` /
 *   `$conditions.debounce`).
 */
function createConditions(vueform: VueformInstance): ConditionsModule
```
