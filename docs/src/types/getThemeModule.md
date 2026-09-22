```ts
/**
 * Returns the resolved instance's theme module, or the inert `noopTheme`
 * surface (token styles resolve to an empty object) when the `theme` module is
 * not registered. Resolves the explicit `vueform` (a `createVueform()` instance
 * or config) when given, otherwise the config injected by the calling
 * component's app.
 */
function getThemeModule(vueform?: VueformInstance): ThemeModule
```
