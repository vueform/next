```ts
/**
 * Returns the resolved instance's i18n module, or the inert `noopI18n`
 * surface (translation tags resolve to their raw tag string, locale maps fall
 * back to their first entry) when the `i18n` module is not registered.
 * Resolves the explicit `vueform` (a `createVueform()` instance or config) when
 * given, otherwise the config injected by the calling component's app.
 */
function getI18nModule(vueform?: VueformInstance): I18nModule
```
