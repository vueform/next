```ts
/**
 * Returns the resolved instance's http module, or the inert `noopHttp` surface
 * (every request rejects with a descriptive error) when the `http` module is
 * not registered. Resolves the explicit `vueform` (a `createVueform()` instance
 * or config) when given, otherwise the config injected by the calling
 * component's app.
 */
function getHttpModule(vueform?: VueformInstance): HttpModule
```
