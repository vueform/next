```ts
/**
 * Returns the security module (sanitizer, gates, and `encrypt` / `decrypt`
 * ciphers). Setup-only when called without an instance; with an explicit
 * `vueform` it resolves that instance's module and works anywhere.
 *
 * @param vueform The owning instance; omit to resolve the calling component's.
 */
function useSecurity(vueform?: VueformInstance): SecurityModule
```
