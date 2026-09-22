import type { VueformInstance } from '~/createVueform'
import {
  isClient,
  isDev,
  isForbiddenKey,
  isProd,
  own,
  toCamelCase,
  warn,
} from '~/utils'
import type {
  SecurityHtmlArea,
  SecurityModule,
  SecurityModuleOptions,
} from './types'

/**
 * A parsed wildcard `allowOrigins` entry. Exactly two forms compile:
 * `scheme://*.host` (any subdomain, at any depth — never the apex host itself)
 * and `scheme://host:*` (that exact host on any port). A wildcard never widens
 * the scheme.
 */
interface OriginPattern {
  protocol: string
  host: string
  anySub: boolean
  anyPort: boolean
  port: string
}

/**
 * Resolves a URL's origin against a base, or `'\0'` when it can't be parsed —
 * an origin no allowlist can contain, so an unparseable URL is refused rather
 * than treated as same-origin.
 */
function originOf(url: string, base: string): string {
  try {
    return new URL(url, base || undefined).origin
  } catch {
    return '\0'
  }
}

/**
 * Resolves a URL against a base, or `null` when it can't be parsed — an
 * unparseable URL is refused, never treated as same-origin.
 */
function urlOf(url: string, base: string): URL | null {
  try {
    return new URL(url, base || undefined)
  } catch {
    return null
  }
}

const WILDCARD_ORIGIN_RE =
  /^([a-zA-Z][a-zA-Z0-9+.-]*):\/\/(\*\.)?([a-zA-Z0-9.-]+)(?::(\*|\d+))?$/

const DEFAULT_PORTS: Record<string, string> = {
  'http:': '80',
  'https:': '443',
  'ws:': '80',
  'wss:': '443',
}

/**
 * Parses an `allowOrigins` entry containing a wildcard into a pattern, or
 * `null` when it isn't one of the two supported forms — a typo'd wildcard must
 * never compile into something that matches more (or less) than the developer
 * meant.
 */
function parseOriginPattern(entry: string): OriginPattern | null {
  const match = WILDCARD_ORIGIN_RE.exec(entry)

  if (!match) return null

  const [, scheme, anySub, host, port] = match

  // The regex also matches plain origins; only the documented wildcard
  // positions qualify, and the host part itself must be wildcard-free.
  if ((!anySub && port !== '*') || host.includes('*')) return null

  return {
    protocol: `${scheme.toLowerCase()}:`,
    host: host.toLowerCase(),
    anySub: !!anySub,
    anyPort: port === '*',
    port: port && port !== '*' ? port : '',
  }
}

/**
 * Whether a request URL falls inside a wildcard origin pattern. Scheme and host
 * match exactly (subdomains only under `*.`); ports compare by their effective
 * value, so `https://host:*` covers the bare `https://host` (the implicit
 * `443`) as well.
 */
function matchesOriginPattern(pattern: OriginPattern, url: URL): boolean {
  if (url.protocol !== pattern.protocol) return false

  const host = url.hostname.toLowerCase()

  if (pattern.anySub) {
    if (!host.endsWith(`.${pattern.host}`)) return false
  } else if (host !== pattern.host) {
    return false
  }

  if (pattern.anyPort) return true

  const urlPort = url.port || DEFAULT_PORTS[url.protocol] || ''
  const patternPort = pattern.port || DEFAULT_PORTS[pattern.protocol] || ''

  return urlPort === patternPort
}

/**
 * Matches a URL scheme prefix (`https:`, `javascript:`, …) per RFC 3986.
 */
const URL_SCHEME_RE = /^[a-zA-Z][a-zA-Z0-9+.-]*:/

/**
 * Creates a security instance from the given app config (`$security`): the
 * `sanitizeHtml` / `sanitizeProps` capabilities, the `allowHtml` /
 * `allowComponents` / `allowOrigins` policy gates, and the `encrypt` /
 * `decrypt` ciphers. Unset capabilities behave as passthroughs; the gates fail
 * closed.
 *
 * @param vueform The Vueform instance whose config to read.
 */
export function createSecurity(vueform: VueformInstance): SecurityModule {
  const { config } = vueform

  const options: SecurityModuleOptions = config.$security ?? {}

  // A half-configured cipher pair can't round-trip persisted values: encrypt
  // without decrypt makes every stored value unreadable, decrypt without
  // encrypt feeds plaintext to the decryptor.
  if (!!own(options, 'encrypt') !== !!own(options, 'decrypt') && isDev()) {
    warn(
      `\`$security.${own(options, 'encrypt') ? 'encrypt' : 'decrypt'}\` is configured without \`${own(options, 'encrypt') ? 'decrypt' : 'encrypt'}\`; persisted values can't round-trip. Define both.`
    )
  }

  let missingEngineWarned = false

  // Every option is read as an own property (`own`): an inherited
  // `Object.prototype.sanitizer` from a polluted prototype must never
  // install itself as the engine.
  const sanitizer = own(options, 'sanitizer')

  // HTML bound for an HTML sink always passes through here. No engine is the
  // unconfigured state (like ciphers): development renders raw with a
  // warning naming the fix; production renders empty — unsanitizable HTML
  // never ships. An identity `sanitizer` is the conscious opt-out.
  const sanitizeHtml = sanitizer
    ? (value?: string) => (typeof value === 'string' ? sanitizer(value) : '')
    : (value?: string) => {
        if (typeof value !== 'string') return ''

        if (isProd()) return ''

        if (!missingEngineWarned) {
          missingEngineWarned = true
          warn(
            'HTML is rendering without a sanitizer — no `$security.sanitizer` is configured (in production it renders empty instead). Install `@vueform/dompurify`, or consciously opt out of sanitization by registering an identity function (`sanitizer: (html) => html`).'
          )
        }

        return value
      }

  const banProps = own(options, 'banProps') ?? []

  const bannedKeys: ReadonlySet<string> = new Set(
    banProps
      .filter((entry): entry is string => typeof entry === 'string')
      .map((key) => key.toLowerCase())
  )

  // Rebuilt without global/sticky flags: those make `test` stateful across
  // keys, and config-held instances may be frozen (no `lastIndex` writes).
  const bannedPatterns: readonly RegExp[] = banProps
    .filter((entry): entry is RegExp => entry instanceof RegExp)
    .map((entry) => new RegExp(entry.source, entry.flags.replace(/[gy]/g, '')))

  /**
   * Whether an attribute entry must never reach a DOM element from an attribute
   * bag. Only the entries where data escalates into markup or re-points objects
   * are hardcoded: `innerHTML`/`outerHTML` keys turn a `v-bind` spread into an
   * HTML sink, and prototype keys would re-point objects. Everything else —
   * inline event handlers (`onclick`, …), `srcdoc`, DOM-clobbering ids — is the
   * app's policy via `$security.banProps`: string entries match
   * case-insensitively, RegExp entries as written (add `i` yourself, e.g.
   * `/^on/i`); both are checked against the original key spelling and its
   * camelized form. Entries are dropped in every value form.
   */
  const hasBans = bannedKeys.size > 0 || bannedPatterns.length > 0

  const computeDangerousProp = (key: string): boolean => {
    if (isForbiddenKey(key)) return true

    const k = key.toLowerCase()

    if (k === 'innerhtml' || k === 'outerhtml') return true

    if (!hasBans) return false

    // Vue camelizes spread keys when matching a component's declared props
    // (an `on-label` schema key reaches an `onLabel` prop), so a ban covers
    // both spellings: the original (the DOM attribute route) and the
    // camelized one (the component prop route).
    const camel = toCamelCase(key)

    if (bannedKeys.has(k) || bannedKeys.has(camel.toLowerCase())) return true

    return bannedPatterns.some(
      (pattern) => pattern.test(key) || pattern.test(camel)
    )
  }

  // Verdicts are memoized per instance: `parts` bags re-filter on proxy
  // access, so the same keys recur constantly and pattern bans shouldn't
  // re-run for each. Per instance, not global — the verdict depends on this
  // app's `banProps`. Capped because untrusted schemas mint the key names:
  // a flood of unique keys resets the cache instead of growing it.
  const verdictCache = new Map<string, boolean>()

  const isDangerousProp = (key: string): boolean => {
    let verdict = verdictCache.get(key)

    if (verdict === undefined) {
      verdict = computeDangerousProp(key)
      if (verdictCache.size >= 2048) verdictCache.clear()
      verdictCache.set(key, verdict)
    }

    return verdict
  }

  /**
   * The attribute-bag filter capability. Returns the _same reference_ when
   * nothing needs stripping — the common case — so `v-bind` diffing and
   * reactivity see the live object; a fresh filtered copy is built only when a
   * dangerous entry is actually present (with a dev warning naming it).
   */
  const sanitizeProps = <T extends Record<string, any>>(attrs: T): T => {
    if (attrs == null || typeof attrs !== 'object') return attrs

    let dirty = false

    for (const key in attrs) {
      if (isDangerousProp(key)) {
        dirty = true
        break
      }
    }

    if (!dirty) return attrs

    const out: Record<string, any> = {}

    for (const key in attrs) {
      if (isDangerousProp(key)) {
        if (isDev()) {
          warn(
            `the \`${key}\` prop was removed from a schema-reachable bag — \`innerHTML\`/\`outerHTML\`, prototype keys, and entries matching \`$security.banProps\` never reach the DOM.`
          )
        }
        continue
      }

      out[key] = attrs[key]
    }

    return out as T
  }

  /**
   * The `sanitizeCss` capability — the brace guard for CSS value fragments.
   */
  const sanitizeCss = (
    value: string | number | null | undefined
  ): string | undefined => {
    if (value == null) return undefined
    if (typeof value === 'number') return String(value)

    if (value.includes('{') || value.includes('}')) {
      if (isDev()) {
        warn(
          `CSS value \`${value}\` was dropped — it must not contain \`{\` or \`}\`.`
        )
      }
      return undefined
    }

    return value
  }

  // Resolved once, lowercase (attribute names compare case-insensitively).
  // The filter's built-in denylist is not expressed here — it applies always
  // and cannot be relaxed; this set only adds to it. The capability binds the
  // set over the pure filter so no call site can forget to apply the policy.
  /**
   * The `sanitizeUrl` capability. Tab, newline and carriage-return characters
   * are removed and surrounding control characters trimmed before scheme
   * detection, mirroring how browsers parse URLs — otherwise `java\tscript:`
   * would slip past the check yet execute when assigned to an `href` or
   * `location`.
   */
  const sanitizeUrl = (url: unknown, schemes: string[]): string | undefined => {
    if (typeof url !== 'string' || url === '') return undefined

    const cleaned = url
      .replace(/[\t\n\r]/g, '')
      .replace(/^[\0- ]+|[\0- ]+$/g, '')

    if (cleaned === '') return undefined

    const match = cleaned.match(URL_SCHEME_RE)

    if (!match) return cleaned

    const scheme = match[0].slice(0, -1).toLowerCase()

    if (schemes.includes(scheme)) return cleaned

    if (isDev()) {
      warn(`URL with disallowed scheme \`${scheme}:\` was rejected:`, url)
    }

    return undefined
  }

  // The gates fail closed; `allowsComponent` warns once per rejected name
  // so a missing allowlist entry is diagnosable without flooding the
  // console on every re-render.
  const allowHtml = new Set(own(options, 'allowHtml') ?? [])
  const allowComponents = new Set(own(options, 'allowComponents') ?? [])
  const rejectedComponents = new Set<string>()

  const allowsHtml = (area: SecurityHtmlArea) => allowHtml.has(area)

  const allowsComponent = (name: string) => {
    if (allowComponents.has(name)) return true

    if (isDev() && !rejectedComponents.has(name)) {
      rejectedComponents.add(name)
      warn(
        `\`${name}\` is not listed in \`$security.allowComponents\`, so it will not resolve to a registered component. Add it to the list to allow it.`
      )
    }

    return false
  }

  // Cross-origin requests are denied by default (an unset `allowOrigins` is
  // equivalent to `[]`): the app's own origin needs no permission, and
  // anything beyond it is a deliberate decision the app states by listing
  // it. Listed origins are normalized once (scheme + host + port); wildcard
  // entries (`https://*.example.com`, `https://example.com:*`) compile to
  // patterns; invalid entries are dropped with a warning rather than
  // silently never matching. `'*'` opts out entirely.
  const allowOriginsOption = own(options, 'allowOrigins') ?? []
  const unrestrictedOrigins = allowOriginsOption.includes('*')
  const allowedOrigins = new Set<string>()
  const originPatterns: OriginPattern[] = []

  if (!unrestrictedOrigins) {
    // The app's own API counts as its own origin — in the browser:
    // `$http.baseURL` is developer config, and a schema can only reach it
    // through a relative URL, which is allowed regardless. An
    // attacker-supplied *absolute* URL bypasses `baseURL` entirely and is
    // still judged against the list, so trusting it here costs nothing and
    // spares every app with a cross-origin API from restating the same
    // origin twice. Outside a browser nothing is trusted implicitly —
    // requests joined against `baseURL` arrive here as absolute URLs and
    // must be listed in `allowOrigins` like any other destination.
    const baseURL = config.$http?.baseURL

    if (baseURL && isClient) {
      const base = originOf(baseURL, window.location.href)
      if (base !== '\0') allowedOrigins.add(base)
    }

    for (const entry of allowOriginsOption) {
      if (entry.includes('*')) {
        const pattern = parseOriginPattern(entry)

        if (pattern) {
          originPatterns.push(pattern)
        } else if (isDev()) {
          warn(
            `\`$security.allowOrigins\` entry \`${entry}\` is not a valid wildcard and was ignored. Supported forms: \`'https://*.example.com'\` (any subdomain) and \`'https://example.com:*'\` (any port); use \`'*'\` alone to allow any origin.`
          )
        }

        continue
      }

      try {
        allowedOrigins.add(new URL(entry).origin)
      } catch {
        if (isDev()) {
          warn(
            `\`$security.allowOrigins\` entry \`${entry}\` is not a valid origin and was ignored. Entries must be absolute origins (e.g. \`'https://api.example.com'\`); use \`'*'\` to allow any origin.`
          )
        }
      }
    }
  }

  const allowsOrigin = (url: string) => {
    if (unrestrictedOrigins) return true

    // Purely relative URLs (paths, queries, hashes) never leave the current
    // document's origin.
    if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(url) && !url.startsWith('//')) {
      return true
    }

    // Outside a browser there is no page origin, so nothing is trusted
    // implicitly — not even `baseURL` — and an absolute URL passes only when
    // its origin is explicitly listed. Fail closed: the browser's "own
    // origin always passes" affordance simply has no server equivalent. (The
    // built-in fetch adapter refuses SSR requests outright anyway; this
    // guards server-capable custom adapters.)
    if (!isClient) {
      const target = urlOf(url, '')

      return (
        !!target &&
        (allowedOrigins.has(target.origin) ||
          originPatterns.some((p) => matchesOriginPattern(p, target)))
      )
    }

    const target = urlOf(url, window.location.href)

    if (!target) return false

    // The app's own origin is always its own business — an absolute URL
    // spelling out the current origin is the same request as the relative
    // form, so it needs no entry in the list.
    return (
      target.origin === window.location.origin ||
      allowedOrigins.has(target.origin) ||
      originPatterns.some((p) => matchesOriginPattern(p, target))
    )
  }

  // Plain identity — not the noop's, whose ciphers warn about an unregistered
  // module (here the module is registered, just without that cipher).
  const identity = (value: string) => value

  return {
    sanitizeHtml,
    sanitizeProps,
    sanitizeCss,
    sanitizeUrl,
    allowsHtml,
    allowsComponent,
    allowsOrigin,
    encrypt: own(options, 'encrypt') ?? identity,
    decrypt: own(options, 'decrypt') ?? identity,
  }
}
