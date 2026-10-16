```ts
/**
 * The argument of a `globals` hook — the config-level one and plugins' alike.
 */
interface GlobalsHookContext {
  /**
   * The resolved Vueform configuration.
   */
  config: VueformConfig

  /**
   * The globals accumulated so far. Read-only — return members to add or
   * override.
   */
  globals: Readonly<Partial<VueformGlobals>>
}
```
