```ts
/**
 * Returns the resolved instance's validation module, or the inert
 * `noopValidation` surface (everything valid) when the `validation` module is
 * not registered. Resolves the explicit `vueform` (a `createVueform()` instance
 * or config) when given, otherwise the config injected by the calling
 * component's app.
 */
function getValidationModule(vueform?: VueformInstance): ValidationModule
```
