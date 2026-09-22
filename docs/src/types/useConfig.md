```ts
/**
 * Returns the resolved Vueform configuration of the calling component's app.
 * Setup-only — throws `NotInstalledError` outside a component context; code
 * with no component holds its `createVueform()` instance (`vueform.config`).
 */
function useConfig(): VueformConfig
```
