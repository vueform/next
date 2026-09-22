```ts
/**
 * Configuration options for the security module (`config.$security`).
 */
interface SecurityModuleOptions {
  /**
   * The sanitization engine (e.g. the DOMPurify wrapper). Like the ciphers,
   * there is no built-in one, and HTML rendering in `allowHtml` areas always
   * passes through it. Without an engine, HTML renders raw with a dev warning
   * in development and renders **empty** in production — install
   * `@vueform/dompurify`, or consciously opt out of sanitization by registering
   * an identity function (`sanitizer: (html) => html`).
   */
  sanitizer?: SecuritySanitizer

  /**
   * Encrypts values before features persist them (e.g. local autosave drafts).
   * There is no built-in cipher — bring a scheme whose key lives outside the
   * stored data, such as a session-delivered key held in memory. When omitted,
   * values are stored as-is.
   */
  encrypt?: SecurityCipher

  /**
   * The inverse of `encrypt`, applied when persisted values are read back. A
   * `decrypt` that throws marks the stored value unreadable — features treat it
   * as absent (e.g. autosave discards the draft).
   */
  decrypt?: SecurityCipher

  /**
   * The areas where strings may render as **HTML**. Empty by default: plain
   * text strings always render (escaped), and HTML-looking strings in an area
   * not listed here render escaped. HTML in an allowed area always passes
   * through `sanitizeHtml` — the `sanitizer` engine, or its fallback (raw + dev
   * warning in development, empty in production).
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
   * Additional keys to drop from every schema-reachable prop bag — schema
   * entries themselves (form entries, group children, flat list prototypes,
   * grid cell / matrix column schemas), `parts` bags, and grid cell `attrs` —
   * **in every value form**. Case-insensitive. Slot HTML is not a prop bag: its
   * attributes are the sanitizer's domain (`sanitizeOptions`).
   *
   * A core set is always banned regardless of this option and cannot be
   * relaxed: prototype keys, `innerHTML` / `outerHTML` / `srcdoc`, and
   * string-valued `on*` entries (function listeners from developer code keep
   * working) — the entries where data would escalate into script or markup.
   * `banProps` only ever tightens. Because schema entries pass the same filter,
   * listing a prop name disables that **channel** for schemas while template
   * usage keeps working — e.g. `['style']` (beacon / overlay CSS in both its
   * string and object forms), `['id', 'name']` (DOM clobbering), or `['parts',
   * 'slots', 'tokens']` (no schema-driven presentation at all).
   */
  banProps?: string[]
}
```
