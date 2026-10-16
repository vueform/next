```ts
/**
 * Global options for the conditions module (the `$conditions` config object).
 */
interface ConditionsModuleOptions {
  /**
   * Whether to use strict comparisons when evaluating structured conditions.
   * Defaults to `false`.
   */
  strict?: boolean

  /**
   * The debounce delay in milliseconds applied before re-evaluating async
   * conditional props when their trigger source changes. Defaults to `300`.
   */
  debounce?: number
}
```
