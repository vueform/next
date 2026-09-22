```ts
/**
 * Returns the resolved instance's conditions module, or the inert
 * `noopConditions` surface (every conditional resolves as met) when the
 * `conditions` module is not registered. Resolves the explicit `vueform` (a
 * `createVueform()` instance or config) when given, otherwise the config
 * injected by the calling component's app.
 */
function getConditionsModule(vueform?: VueformInstance): ConditionsModule
```
