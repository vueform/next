import { definePlugin, own, type SecuritySanitizer } from '@vueform/core'
import DOMPurify, {
  type Config as DOMPurifyConfig,
  type DOMPurify as DOMPurifyType,
} from 'isomorphic-dompurify'

declare module '@vueform/core' {
  interface SecurityModuleOptions {
    /**
     * Passed directly to `DOMPurify.sanitize()` as the config object.
     */
    sanitizeOptions?: DOMPurifyConfig

    /**
     * Receives the DOMPurify instance before first use — add hooks, set global
     * config, etc.
     */
    sanitizeInit?: (DOMPurify: DOMPurifyType) => DOMPurifyType
  }
}

/**
 * Builds the DOMPurify-backed sanitizer for the security module's sanitize
 * capability (`$security.sanitizer`).
 */
export function domPurifySanitizer(
  sanitizeInit: (dp: typeof DOMPurify) => typeof DOMPurify,
  sanitizeOptions: Record<string, any>
): SecuritySanitizer {
  const domPurify = sanitizeInit(DOMPurify)

  return (html: string) => domPurify.sanitize(html, sanitizeOptions)
}

// eslint-disable-next-line
export default definePlugin(() => ({
  name: 'dompurify',
  config(config) {
    const options = config.$security ?? {}

    // Fill only the sanitize engine's keys — everything else in `$security`
    // (the `allowHtml` / `allowComponents` / `allowOrigins` policy, the
    // ciphers) passes through untouched. HTML in allowed areas always renders
    // through the engine, so installing it is all the plugin needs to do; a
    // user-provided `sanitizer` keeps winning. Every option is read as an
    // OWN property: a polluted `Object.prototype.sanitizer` (or
    // `sanitizeInit` / `sanitizeOptions`) must never install itself as — or
    // configure — the engine through an inherited read.
    config.$security = {
      ...options,
      sanitizer:
        own(options, 'sanitizer') ??
        domPurifySanitizer(
          own(options as any, 'sanitizeInit') ?? ((DOMPurify) => DOMPurify),
          own(options as any, 'sanitizeOptions') ?? {}
        ),
    }
  },
}))
