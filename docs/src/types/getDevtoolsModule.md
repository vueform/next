```ts
/**
 * Returns the resolved instance's devtools module, or the inert `noopDevtools`
 * surface (nothing is tracked, every method no-ops) when the `devtools` module
 * is not registered. Resolves the explicit `vueform` (a `createVueform()`
 * instance or config) when given, otherwise the config injected by the calling
 * component's app.
 */
function getDevtoolsModule(vueform?: VueformInstance): DevtoolsModule
```
