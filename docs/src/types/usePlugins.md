```ts
/**
 * Applies registered Vueform plugins to the current component and returns the
 * component's API object.
 *
 * @param createApi A factory function that produces the component's public API.
 * @param events The component's event system created by `defineEvents`.
 */
function usePlugins<T extends Record<string, any>>(
  createApi: () => T,
  events?: Record<string, any>
): T
```
