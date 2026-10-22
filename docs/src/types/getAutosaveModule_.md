```ts
/**
 * Returns the resolved instance's autosave module, or the inert `noopAutosave`
 * surface (the `autosave` and `draft` props have no effect, context methods
 * no-op) when the
 * `autosave` module is not registered. Resolves the explicit `vueform` (a
 * `createVueform()` instance or config) when given, otherwise the config
 * injected by the calling component's app.
 */
function getAutosaveModule(vueform?: VueformInstance): AutosaveModule
```
