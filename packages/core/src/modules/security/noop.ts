import type { VueformConfig } from '#src/helpers'
import { isDev, isProd } from '#src/utils'

import type { SecurityModule } from './types'

// Shared frozen empty bag for the production fail-closed branch, so identity
// stays stable across renders.
const EMPTY_PROPS = Object.freeze({})

/**
 * The security surface used when the `security` module is not registered. The
 * module family's rule applies: an absent module means the feature is absent —
 * `validation` absent counts everything valid, `security` absent enforces
 * nothing. Two regimes:
 *
 * - **No configured intent**: fully permissive. HTML renders in every area
 *   (unsanitized — there is no engine), any component name resolves, requests
 *   are unrestricted, prop bags and persisted values pass through untouched.
 *   Deliberately omitting the module is the documented way to opt out of the
 *   protections wholesale — URL scheme checks and CSS containment included.
 *   (Prototype-key guards still apply — they are invariants, not policy — and
 *   slot HTML is inserted with the platform's own `innerHTML` semantics, so
 *   `<script>` elements stay inert regardless.)
 * - **Configured intent without the module**: every policy option defaults
 *   open, so for each of them — `allowHtml`, `allowComponents`,
 *   `allowOrigins`, `banAttrs`, `allowProps`, the ciphers — mere presence is
 *   the intent, `[]` and permissive spellings (`['*']`, `['**']`) included:
 *   whoever touches the policy cares about it. In development the surface
 *   stays permissive so the app remains workable, and `createVueform()`'s
 *   orphan-`$security`-options warning names the fix at startup. In
 *   production the same state **fails closed** instead — HTML escapes,
 *   components don't resolve, requests stay on the app's own origin, prop
 *   bags come back empty, prop references don't resolve, ciphers resolve
 *   `undefined` — and the misconfiguration can never ship looking enforced
 *   while it isn't.
 *
 * Normal operation is identical in both environments; only the misconfiguration
 * state differs.
 *
 * @param config The config of the instance the noop stands in for.
 */
export function noopSecurity(config: VueformConfig): SecurityModule {
  const options = config.$security

  const ciphersConfigured = !!(options?.encrypt || options?.decrypt)
  const originsConfigured = !!options?.allowOrigins
  const banAttrsConfigured = !!options?.banAttrs
  const allowPropsConfigured = !!options?.allowProps
  const allowHtmlConfigured = !!options?.allowHtml
  const allowComponentsConfigured = !!options?.allowComponents

  // Fail closed in production: refusing to persist (or hand over) plaintext
  // despite configured ciphers — `undefined` makes the feature treat the
  // value as unpersistable / unreadable. (The dev-time diagnosis lives in
  // `createVueform`'s orphan-`$security`-options warning.)
  const cipher = (value: string) =>
    ciphersConfigured && isProd() ? undefined : value

  // Fail closed to the app's own origin: relative URLs and absolute URLs
  // spelling out the page origin still pass — blocking those would break
  // even same-origin submits, which no misconfiguration regime should.
  const allowsOrigin = (url: string) => {
    if (!originsConfigured || isDev()) return true

    if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(url) && !url.startsWith('//')) {
      return true
    }

    if (typeof window === 'undefined') return false

    try {
      return (
        new URL(url, window.location.href).origin === window.location.origin
      )
    } catch {
      return false
    }
  }

  return {
    sanitizeHtml: (value?: string) => (typeof value === 'string' ? value : ''),
    sanitizeProps: (props) =>
      // Fail closed in production: emptied bags also empty schema entries
      // through `useSchema`, so the broken state is unmissable.
      banAttrsConfigured && isProd() ? (EMPTY_PROPS as typeof props) : props,
    sanitizeCss: (value) => (value != null ? String(value) : undefined),
    sanitizeUrl: (url) => (typeof url === 'string' ? url : undefined),
    allowsHtml: () => !allowHtmlConfigured || isDev(),
    allowsComponent: () => !allowComponentsConfigured || isDev(),
    allowsProp: () => !allowPropsConfigured || isDev(),
    allowsOrigin,
    encrypt: cipher,
    decrypt: cipher,
  }
}
