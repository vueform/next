```ts
/**
 * Creates a security instance from the given app config (`$security`): the
 * `sanitizeHtml` / `sanitizeProps` capabilities, the `allowHtml` /
 * `allowComponents` / `allowProps` / `allowOrigins` policy gates, and the
 * `encrypt` / `decrypt` ciphers. Every policy option defaults open: unset, a
 * gate allows everything and a capability passes values through. Setting an
 * option turns it into the stated policy — an allowlist (or, for `banAttrs`,
 * a banlist) enforced as written.
 *
 * @param vueform The Vueform instance whose config to read.
 */
function createSecurity(vueform: VueformInstance): SecurityModule
```
