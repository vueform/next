```ts
/**
 * Global layout values derived from the Vueform configuration, held on the
 * instance (`vueform.globals`). The base values come from the default config's
 * `globals` hook; user configs and plugins extend them through theirs.
 */
interface VueformGlobals {
  /**
   * The default responsive breakpoint used for layout calculations.
   */
  defaultBreakpoint: ComputedRef<string>
}
```
