```ts
/**
 * Returns the resolved instance's security module, or the inert `noopSecurity`
 * surface (permissive unless `$security` intent is configured) when the
 * `security` module is not registered. Resolves the explicit `vueform` (a
 * `createVueform()` instance) when given, otherwise the instance injected by
 * the calling component's app.
 */
function getSecurityModule(vueform?: VueformInstance): SecurityModule
```
