/**
 * Configuration options for the security module (`config.$security`).
 */
export interface SecurityModuleOptions {
  /**
   * The sanitization engine (e.g. the DOMPurify wrapper). Like the ciphers,
   * there is no built-in one, and HTML rendering in allowed areas always
   * passes through it. Without an engine, `allowHtml` decides the fallback:
   * unset, HTML renders raw with no warning, in production too; set — stated
   * intent — HTML renders raw with a dev warning in development and renders
   * **empty** in production. Install `@vueform/dompurify`, or consciously opt
   * out of sanitization by registering an identity function
   * (`sanitizer: (html) => html`).
   */
  sanitizer?: SecuritySanitizer

  /**
   * Encrypts values before features persist them (e.g. stored drafts).
   * There is no built-in cipher — bring a scheme whose key lives outside the
   * stored data, such as a session-delivered key held in memory. When omitted,
   * values are stored as-is.
   */
  encrypt?: SecurityCipher

  /**
   * The inverse of `encrypt`, applied when persisted values are read back. A
   * `decrypt` that throws marks the stored value unreadable — features treat it
   * as absent (e.g. the stored draft is discarded).
   */
  decrypt?: SecurityCipher

  /**
   * The areas where strings may render as **HTML**. Unset, every area may —
   * HTML renders out of the box. Setting the option turns it into an
   * allowlist: an area not listed renders HTML-looking strings escaped
   * (`[]` escapes everywhere), and plain text strings always render. HTML in
   * an allowed area always passes through `sanitizeHtml` — the `sanitizer`
   * engine, or its fallback (raw + dev warning in development, empty in
   * production).
   */
  allowHtml?: SecurityHtmlArea[]

  /**
   * The globally registered component names a string may resolve to — in
   * `slots` entries, the `template` prop, the `layout` prop, and the schema
   * `component` key. Empty by default, so no name resolves; a name outside the
   * list is ignored with a dev warning. Built-in `Vf*` names derived from an
   * element's `type` are exempt (they are the element vocabulary itself).
   */
  allowComponents?: string[]

  /**
   * The **cross-origin** destinations HTTP requests may target, as absolute
   * origins (e.g. `'https://api.example.com'`). Unset is equivalent to `[]`:
   * requests to the app's own origin — relative URLs, and absolute URLs
   * spelling out the current origin — always pass, while everything else is
   * rejected before the request is sent unless its origin is listed. `['*']`
   * opts out of the restriction entirely.
   *
   * Two wildcard forms are supported: `'https://*.example.com'` matches any
   * subdomain (at any depth, never the apex host itself), and
   * `'https://example.com:*'` matches that exact host on any port. A wildcard
   * never widens the scheme.
   *
   * Outside a browser nothing is trusted implicitly — no page origin, no
   * `baseURL` — so an absolute URL passes only when its origin is listed. The
   * HTTP stack is client-side anyway: the built-in fetch adapter refuses SSR
   * requests.
   */
  allowOrigins?: string[]

  /**
   * Keys to drop from every schema-reachable prop bag — schema entries
   * themselves (form entries, group children, flat list prototypes, grid cell /
   * matrix column schemas), `parts` bags, and grid cell `attrs` — **in every
   * value form**. String entries match case-insensitively; RegExp entries as
   * written (add the `i` flag yourself, e.g. `/^on/i`). Both are checked
   * against the original key spelling and its camelized form — Vue camelizes
   * spread keys when matching declared component props, so a ban on `onLabel`
   * also catches `on-label`. Slot HTML is not a prop bag: its attributes are
   * the sanitizer's domain (`sanitizeOptions`).
   *
   * Only a minimal set is banned regardless of this option and cannot be
   * relaxed: prototype keys and `innerHTML` / `outerHTML` — the entries that
   * turn a `v-bind` spread into an HTML sink or re-point object prototypes.
   * Everything else is this option's responsibility. **When schemas can come
   * from untrusted sources, configure at least `[/^on/i, 'srcdoc']`** so inline
   * event handlers (`onclick`, …) and iframe HTML never reach the DOM. Because
   * schema entries pass the same filter, listing a prop name disables that
   * **channel** for schemas while template usage keeps working — e.g.
   * `['style']` (beacon / overlay CSS in both its string and object forms),
   * `['id', 'name']` (DOM clobbering), or `['parts', 'slots', 'tokens']` (no
   * schema-driven presentation at all). Dropped entries warn in development.
   */
  banAttrs?: (string | RegExp)[]

  /**
   * The element prop paths that `path@prop` / `@prop` references (in
   * conditions and expressions) may resolve. **Fail-closed**: unset is
   * equivalent to `[]`, so once the security module is registered no prop
   * reference resolves until its prop is listed (`'**'` allows everything). A
   * denied reference resolves as `undefined` (conditions evaluate unmet) with
   * a dev warning.
   *
   * Each entry is a pattern over the prop part of a reference (the part after
   * `@`, with `[n]` index segments read as nesting):
   *
   * - `'propName'` — the flat reference (`some_element@propName`, `@propName`)
   *   resolves; nested access does not.
   * - `'propName.*'` — one nested level resolves (`@propName.foo`), the flat
   *   form does not.
   * - `'propName.*.*'` — one **or** two nested levels resolve (trailing `*`
   *   segments are optional), never the flat form. Static segments may appear
   *   midway (`'propName.*.foo.*'` — the static segment must be present, so
   *   `@propName.x.foo` and `@propName.x.foo.y` resolve, `@propName.x` does
   *   not).
   * - `'propName.**'` — any nesting depth resolves (at least one level), never
   *   the flat form.
   * - `'*propName'` / `'propName*'` — any prop name ending / starting with
   *   `propName`; combines with the nesting forms (`'*Label.*'`).
   * - `'*'` — every prop, flat references only (no nesting).
   * - `'**'` — every prop at every depth, flat included (the explicit
   *   opt-out).
   *
   * An entry may also be a RegExp, tested as written against the full prop
   * path (`[n]` index access normalized to dots, e.g. `model.0`) — anchor it
   * yourself.
   */
  allowProps?: (string | RegExp)[]
}

/**
 * The engine behind the security module's _sanitize_ capability — a function
 * taking raw HTML and returning the safe output (e.g. the DOMPurify wrapper).
 * Engine slots are per-capability, never module-wide: a sanitizer knows nothing
 * about the module's other capabilities (like the encryption ciphers), and a
 * future externally-backed capability would get its own slot.
 */
export type SecuritySanitizer = (html: string) => string

/**
 * An app-provided encryption or decryption function. Receives the value and a
 * purpose tag identifying the call site (e.g. `'draft'`), so one
 * implementation can serve every feature that encrypts — branching per purpose
 * if it ever needs to. May be async (Web Crypto).
 */
export type SecurityCipher = (
  value: string,
  purpose: string
) => string | Promise<string>

/**
 * The areas where a schema string may render as HTML: `content` is
 * `VfContent`'s `content` prop, `slots` are string `slots` entries, and `grid`
 * covers grid string cells.
 */
export type SecurityHtmlArea = 'content' | 'grid' | 'slots'

/**
 * The security module instance providing HTML sanitization, schema gating,
 * request-origin policy, and app-level encryption for persisted values.
 */
export interface SecurityModule {
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
   * component of that name (`$security.allowComponents`). Warns once per name
   * in dev when it rejects. Callers consult it only for strings intended as
   * component names (explicit `component` / `template` / `layout` props, or
   * slot strings shaped like a component name), so a miss is always worth
   * surfacing.
   *
   * @param name The component name.
   */
  allowsComponent: (name: string) => boolean

  /**
   * Whether a `path@prop` / `@prop` reference may resolve the given prop path,
   * per `$security.allowProps`. Fail-closed: with the module registered and
   * the option empty or unset, every prop reference is denied. Consulted by
   * structured conditions and by expression engines' `PROP()` / `SELF()`
   * resolution. Warns once per denied prop in dev.
   *
   * @param prop The referenced prop path (the part after `@`, e.g.
   *   `'selectedLabel'` or `'model.0'`).
   */
  allowsProp: (prop: string) => boolean

  /**
   * Whether an HTTP request URL is permitted by `$security.allowOrigins`.
   * Fail-closed: when the option is unset, cross-origin requests are denied —
   * only relative URLs, the page's own origin, and (in the browser) the
   * `$http.baseURL` origin pass. Consulted by the HTTP module before sending
   * any request.
   *
   * @param url The request URL, resolved or as passed to the HTTP module.
   */
  allowsOrigin: (url: string) => boolean

  /**
   * Encrypts a value with the configured `$security.encrypt`, passing the
   * calling feature's purpose tag. Identity when no cipher is configured.
   *
   * @param value The plaintext value.
   * @param purpose The call-site tag (e.g. `'draft'`).
   */
  encrypt: SecurityCipher

  /**
   * Decrypts a value with the configured `$security.decrypt`, passing the
   * calling feature's purpose tag. Identity when no cipher is configured.
   *
   * @param value The stored value.
   * @param purpose The call-site tag (e.g. `'draft'`).
   */
  decrypt: SecurityCipher
}
