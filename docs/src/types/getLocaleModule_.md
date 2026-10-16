```ts
/**
 * Returns the resolved instance's locale module, or the inert `noopLocale`
 * surface (translation tags resolve to their raw tag string, locale maps fall
 * back to their first entry) when the `locale` module is not registered.
 * Resolves the explicit `vueform` (a `createVueform()` instance or config) when
 * given, otherwise the config injected by the calling component's app.
 */
function getLocaleModule(vueform?: VueformInstance): LocaleModule
```
