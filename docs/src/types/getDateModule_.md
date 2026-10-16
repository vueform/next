```ts
/**
 * Returns the resolved instance's date module. Throws when the module is not
 * registered. Resolves the explicit `vueform` (a `createVueform()` instance or
 * config) when given, otherwise the config injected by the calling component's
 * app.
 */
function getDateModule(vueform?: VueformInstance): DateModule
```
