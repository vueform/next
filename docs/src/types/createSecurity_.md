```ts
/**
 * Creates a security instance from the given app config (`$security`): the
 * `sanitizeHtml` / `sanitizeProps` capabilities, the `allowHtml` /
 * `allowComponents` / `allowOrigins` policy gates, and the `encrypt` /
 * `decrypt` ciphers. Unset capabilities behave as passthroughs; the gates fail
 * closed, except `allowHtml`, which allows every area until set.
 *
 * @param vueform The Vueform instance whose config to read.
 */
function createSecurity(vueform: VueformInstance): SecurityModule
```
