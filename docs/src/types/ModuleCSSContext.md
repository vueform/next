```ts
/**
 * The context passed to a module's `getCSS` hook when the instance collects its
 * CSS (`vueform.getCSS()` / `vueform.getStyleTag()`).
 */
type ModuleCSSContext = {
  /**
   * The Vueform instance whose CSS is being collected — its resolved
   * configuration is `vueform.config`.
   */
  vueform: VueformInstance
}
```
