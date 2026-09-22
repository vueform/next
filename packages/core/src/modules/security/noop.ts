import type { VueformConfig } from '~/helpers'
import { isDev, isProd } from '~/utils'
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
 * - **Configured intent without the module** (`allowHtml`, `allowComponents`,
 *   `allowOrigins` entries, `banProps`, ciphers — a config that reads like
 *   policy): in development the surface stays permissive so the app remains
 *   workable, and `createVueform()`'s orphan-`$security`-options warning names
 *   the fix at startup. In production the same state **fails closed** instead —
 *   HTML escapes, components don't resolve, requests are blocked, prop bags
 *   come back empty, ciphers throw — and the misconfiguration can never ship
 *   looking enforced while it isn't. (`allowOrigins: ['*']` is not intent to
 *   restrict: permissive behavior is exactly its configured semantics.)
 *
 * Normal operation is identical in both environments; only the misconfiguration
 * state differs.
 *
 * @param config The config of the instance the noop stands in for.
 */
export function noopSecurity(config: VueformConfig): SecurityModule {
  const options = config.$security

  const ciphersConfigured = !!(options?.encrypt || options?.decrypt)
  const originsConfigured = !!(
    options?.allowOrigins?.length && !options.allowOrigins.includes('*')
  )
  const banPropsConfigured = !!options?.banProps?.length
  const allowHtmlConfigured = !!options?.allowHtml?.length
  const allowComponentsConfigured = !!options?.allowComponents?.length

  const cipher = (value: string) => {
    if (!ciphersConfigured) return value

    // Fail closed in production: refusing to persist plaintext despite
    // configured ciphers. (The dev-time diagnosis lives in `createVueform`'s
    // orphan-`$security`-options warning.)
    if (isProd()) {
      throw new Error(
        '[Vueform error]: `$security.encrypt` / `decrypt` are configured but the `security` module is not registered — refusing to persist values unencrypted. Register it via `createVueform({ modules: { security } })`.'
      )
    }

    return value
  }

  return {
    sanitizeHtml: (value?: string) => (typeof value === 'string' ? value : ''),
    sanitizeProps: (props) =>
      // Fail closed in production: emptied bags also empty schema entries
      // through `useSchema`, so the broken state is unmissable.
      banPropsConfigured && isProd() ? (EMPTY_PROPS as typeof props) : props,
    sanitizeCss: (value) => (value != null ? String(value) : undefined),
    sanitizeUrl: (url) => (typeof url === 'string' ? url : undefined),
    allowsHtml: () => !allowHtmlConfigured || isDev(),
    allowsComponent: () => !allowComponentsConfigured || isDev(),
    allowsOrigin: () => !originsConfigured || isDev(),
    encrypt: cipher,
    decrypt: cipher,
  }
}
