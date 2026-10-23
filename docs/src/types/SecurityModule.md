```ts
/**
 * The security module instance providing HTML sanitization, schema gating,
 * request-origin policy, and app-level encryption for persisted values.
 */
interface SecurityModule {
  /**
   * Sanitizes an HTML string for an HTML sink. With a `$security.sanitizer`
   * engine, its output. Without one, `$security.allowHtml` decides: unset —
   * no stated HTML policy — the string passes through raw, silently, in
   * production too; set, the string passes through raw with a one-time dev
   * warning in development and comes back **empty** in production
   * (unsanitizable HTML never ships). Register an identity `sanitizer` to
   * consciously opt out. Returns an empty string for non-string input.
   *
   * @param value The HTML string to sanitize.
   */
  sanitizeHtml: (value?: string) => string

  /**
   * Filters a schema-reachable prop bag (schema entries, `parts` bags, grid
   * cell `attrs`) down to entries safe to bind: the built-in denylist
   * (`innerHTML`/`outerHTML`, prototype keys) plus the entries matching
   * `$security.banAttrs` (strings or RegExps), dropped in every value form with
   * a dev warning. Returns the same reference when nothing needs stripping.
   * Filtering is a module feature: without the `security` module registered,
   * bags pass through unchanged.
   *
   * @param props The prop bag to filter.
   */
  sanitizeProps: <T extends Record<string, any>>(props: T) => T

  /**
   * Guards a schema-supplied CSS value fragment before interpolation into
   * `<style>` text: a `{`/`}` could close the scoped rule and inject arbitrary
   * selectors (e.g. attribute-selector exfiltration of typed input values), so
   * brace-bearing values resolve to `undefined` with a dev warning. Numbers
   * stringify; `null`/`undefined` pass through as `undefined`. Consumed by
   * grid/matrix layout CSS and theme token values. Without the module, values
   * pass through unchecked.
   *
   * @param value The candidate CSS value fragment.
   */
  sanitizeCss: (value: string | number | null | undefined) => string | undefined

  /**
   * Validates a URL against an allowlist of schemes, returning the URL when
   * safe and `undefined` (with a dev warning) when not. Relative URLs always
   * pass; tab/newline/carriage-return characters are stripped before scheme
   * detection, mirroring browser URL parsing — this is what keeps `javascript:`
   * (and obfuscations like `java\tscript:`) out of `href`, `redirect`, and file
   * URL sinks. Without the module, URLs pass through unchecked.
   *
   * @param url The candidate URL (non-strings resolve to `undefined`).
   * @param schemes Lowercase schemes to allow, without the trailing colon.
   */
  sanitizeUrl: (url: unknown, schemes: string[]) => string | undefined

  /**
   * Whether strings in the given area may render as HTML — `true` for every
   * area while `$security.allowHtml` is unset, pure membership once it is
   * set. A refusal renders the string escaped. Sanitization is not this
   * gate's concern: HTML that passes always renders through `sanitizeHtml`.
   *
   * @param area The HTML area (`'content'`, `'grid'`, or `'slots'`).
   */
  allowsHtml: (area: SecurityHtmlArea) => boolean

  /**
   * Whether a component name string may resolve to the globally registered
   * component of that name — `true` for every name while
   * `$security.allowComponents` is unset, pure membership once it is set
   * (then warning once per rejected name in dev). Callers consult it only for
   * strings intended as component names (explicit `component` / `template` /
   * `layout` props, or slot strings shaped like a component name), so a miss
   * is always worth surfacing.
   *
   * @param name The component name.
   */
  allowsComponent: (name: string) => boolean

  /**
   * Whether a `path@prop` / `@prop` reference may resolve the given prop path
   * — `true` for every path while `$security.allowProps` is unset, pure
   * pattern membership once it is set (`[]` denies everything). Consulted by
   * structured conditions and by expression engines' `PROP()` / `SELF()`
   * resolution. Warns once per denied prop in dev.
   *
   * @param prop The referenced prop path (the part after `@`, e.g.
   *   `'selectedLabel'` or `'model.0'`).
   */
  allowsProp: (prop: string) => boolean

  /**
   * Whether an HTTP request URL is permitted by `$security.allowOrigins` —
   * `true` for every URL while the option is unset. Once it is set,
   * cross-origin requests are denied — only relative URLs, the page's own
   * origin, (in the browser) the `$http.baseURL` origin, and the listed
   * origins pass. Consulted by the HTTP module before sending any request.
   *
   * @param url The request URL, resolved or as passed to the HTTP module.
   */
  allowsOrigin: (url: string) => boolean

  /**
   * Encrypts a value with the configured `$security.encrypt`, passing the
   * calling feature's purpose tag. Identity when no cipher is configured.
   * Resolves `undefined` when the cipher state fails closed (a
   * half-configured pair in production, or configured ciphers without the
   * module) — the feature must treat the value as unpersistable.
   *
   * @param value The plaintext value.
   * @param purpose The call-site tag (e.g. `'draft'`).
   */
  encrypt: SecurityModuleCipher

  /**
   * Decrypts a value with the configured `$security.decrypt`, passing the
   * calling feature's purpose tag. Identity when no cipher is configured.
   * Resolves `undefined` when the cipher state fails closed (a
   * half-configured pair in production, or configured ciphers without the
   * module) — the feature must treat the stored value as unreadable.
   *
   * @param value The stored value.
   * @param purpose The call-site tag (e.g. `'draft'`).
   */
  decrypt: SecurityModuleCipher
}
```
