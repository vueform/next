```ts
/**
 * Injects the full generated CSS (theme variables + grid) into the document —
 * via `useHead` when available, otherwise a `<style>` tag. Called once by the
 * module's install hook.
 *
 * @param app The Vue app instance.
 * @param config The resolved Vueform configuration.
 */
function injectThemeCss(app: App, vueform: VueformInstance): void
```
