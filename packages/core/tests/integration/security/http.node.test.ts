// @vitest-environment node
/**
 * # Network trust — platform guarantees
 *
 * The HTTP adapter builds request headers through the WHATWG `Headers` class,
 * which validates header names and values per the fetch specification. That
 * validation is what stops header values containing CR/LF from splitting into
 * additional headers. It is enforced by the platform's own `Headers`
 * implementation — browsers natively, undici in Node — which is why this file
 * runs in the node environment: happy-dom's `Headers` polyfill skips the
 * validation, so asserting it there would test the wrong implementation.
 */
// The main barrel first: entering the graph at the modules barrel alone
// evaluates module definitions before `~/helpers` finishes initializing.
import '#core'
import { describe, expect, it } from 'vitest'

import { security } from '#core/modules'

/**
 * Builds the security module against a bare config, the way `createVueform`
 * does — in this node environment `isClient` is `false`, so the module resolves
 * its origin policy exactly as it would during SSR.
 */
function makeSecurity(config: Record<string, any>) {
  return security.create({ vueform: { config } } as any)
}

describe('Security: header value validation', () => {
  /**
   * Threat: schema-supplied `headers` (submit and items requests accept them)
   * carrying a value with an embedded line break, smuggling an extra header
   * into the request.
   *
   * Measure: the adapter constructs headers via `new Headers(config.headers)`;
   * the spec-compliant implementations reject invalid values outright, so the
   * request never leaves with a forged header.
   */
  it('should reject header values containing line breaks', () => {
    expect(() => new Headers({ 'X-Test': 'a\r\nX-Forged: b' })).toThrowError()
    expect(() => new Headers({ 'X-Test': 'a\nX-Forged: b' })).toThrowError()
  })

  /**
   * Threat: invalid header names sneaking through as object keys.
   *
   * Measure: names are validated the same way as values.
   */
  it('should reject invalid header names', () => {
    expect(() => new Headers({ 'X-Te st': 'a' })).toThrowError()
  })
})

describe('Security: request origins outside a browser', () => {
  /**
   * Threat: a server-capable custom adapter combined with the browser's
   * same-origin affordance being absent — there is no page origin on the
   * server, so nothing can be trusted implicitly. An "allow all when nothing is
   * configured" reading would make the origin policy silently nonexistent in
   * exactly the environment with no other guard.
   *
   * Measure: outside a browser the policy fails closed — with no `allowOrigins`
   * entries, every absolute URL is denied. Relative URLs still pass (they
   * cannot address a host by themselves).
   *
   * Verified red→green: absolute URLs passed on the server before the
   * fail-closed change.
   */
  it('should deny absolute URLs on the server with no allowlist', () => {
    const sec = makeSecurity({ $security: {} })

    expect(sec.allowsOrigin('https://api.example.com/save')).toBe(false)
    expect(sec.allowsOrigin('/save')).toBe(true)
  })

  /**
   * Threat: the `$http.baseURL` implicit trust leaking into SSR. In the browser
   * that trust is safe because a schema can only reach `baseURL` through a
   * relative URL; on the server the joined URL is judged as an absolute one,
   * and trusting it implicitly would send requests during SSR that the app
   * never explicitly sanctioned there.
   *
   * Measure: `baseURL` is trusted in the browser only. On the server its origin
   * must be listed in `allowOrigins` like any other destination.
   *
   * Verified red→green: the baseURL origin passed on the server before the
   * change.
   */
  it('should not trust the baseURL origin on the server', () => {
    const sec = makeSecurity({
      $security: {},
      $http: { baseURL: 'https://api.example.com' },
    })

    expect(sec.allowsOrigin('https://api.example.com/save')).toBe(false)

    const listed = makeSecurity({
      $security: { allowOrigins: ['https://api.example.com'] },
      $http: { baseURL: 'https://api.example.com' },
    })

    expect(listed.allowsOrigin('https://api.example.com/save')).toBe(true)
  })

  /**
   * Threat: none — the positive paths. Explicit entries, wildcards, and the
   * `'*'` opt-out must mean the same thing on the server as in the browser.
   */
  it('should honor explicit entries, wildcards, and `*` on the server', () => {
    const sec = makeSecurity({
      $security: {
        allowOrigins: ['https://api.example.com', 'https://*.cdn.example.com'],
      },
    })

    expect(sec.allowsOrigin('https://api.example.com/save')).toBe(true)
    expect(sec.allowsOrigin('https://a.cdn.example.com/x')).toBe(true)
    expect(sec.allowsOrigin('https://evil.example.net/x')).toBe(false)

    const open = makeSecurity({ $security: { allowOrigins: ['*'] } })
    expect(open.allowsOrigin('https://anywhere.example.net/x')).toBe(true)
  })
})
