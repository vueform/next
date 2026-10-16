```ts
/**
 * Resolves the Vueform instance a call should read from: the explicit instance
 * when given, otherwise the instance injected by the calling component's app.
 * Throws `NotInstalledError` when neither is available.
 *
 * @param vueform Explicit instance, when the caller passed one.
 */
function resolveVueform(vueform?: VueformInstance): VueformInstance
```
