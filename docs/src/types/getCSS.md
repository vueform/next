```ts
/**
 * Generates the full CSS string from the Vueform config, including grid
 * utilities and theme custom properties. Exposed on the theme module definition
 * (`theme.getCSS`) and consumed by `vueform.getCSS()` for SSR/SSG style
 * extraction.
 *
 * @param config The resolved Vueform configuration.
 */
function getCSS(vueform: VueformInstance): string
```
