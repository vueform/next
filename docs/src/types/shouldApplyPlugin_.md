```ts
/**
 * Determines whether a plugin should be applied to the given component based on
 * the plugin's `apply` criteria.
 *
 * @param apply The plugin's apply filter (string, array, regex, function, or
 *   undefined).
 * @param component The Vueform component definition to test against.
 */
function shouldApplyPlugin(
  apply: VueformPlugin['apply'],
  component: VueformComponent
): boolean
```
