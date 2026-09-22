/**
 * # Misconfiguration containment — production
 *
 * Threat model: a modular setup configures `$security` policies
 * (`allowOrigins`, `banProps`, ciphers) but forgets to register the `security`
 * module. In development the inert noop surface warns and stays permissive so
 * the app remains workable while the console names the fix. Those warnings are
 * compiled out of production builds — so in production the same
 * misconfiguration **fails closed** instead: requests are blocked, attribute
 * bags are emptied, and ciphers refuse to run, HTML escapes, component names
 * stop resolving. A config that reads like a lock can never ship unlocked and
 * silent. (With NO configured intent, the module family's rule applies instead:
 * an absent module means the feature is absent — everything is permitted, in
 * every environment.)
 *
 * Normal operation (module registered, or nothing configured) is identical in
 * both environments; only this misconfiguration state differs.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { noopSecurity } from '../../src/modules/security/noop'

afterEach(() => {
  vi.unstubAllEnvs()
})

function prod() {
  vi.stubEnv('NODE_ENV', 'production')
}

describe('Security: noop surface in production', () => {
  describe('`allowsOrigin`', () => {
    /**
     * Threat: `allowOrigins` configured without the module — in production
     * there is no warning, and permissive behavior would mean every request
     * flows unrestricted while the config claims otherwise.
     *
     * Measure: discovered intent fails closed — every request is refused until
     * the module is registered.
     *
     * Verified red→green: the noop allowed all requests in production before
     * the fail-closed change.
     */
    it('should block requests when allowOrigins is configured', () => {
      prod()
      const sec = noopSecurity({
        $security: { allowOrigins: ['https://api.example.com'] },
      } as any)

      expect(sec.allowsOrigin('https://api.example.com/save')).toBe(false)
      expect(sec.allowsOrigin('/save')).toBe(false)
    })

    /**
     * Threat: none — no intent, nothing to enforce. An unconfigured modular app
     * keeps its requests.
     */
    it('should allow requests when allowOrigins is not configured', () => {
      prod()
      const sec = noopSecurity({ $security: {} } as any)

      expect(sec.allowsOrigin('https://api.example.com/save')).toBe(true)
    })

    /**
     * Threat: over-blocking the explicit opt-out. `['*']` means "no
     * restriction" — the noop's permissive behavior already IS the configured
     * semantics, so there is nothing to fail closed about.
     */
    it('should allow requests when allowOrigins is `["*"]`', () => {
      prod()
      const sec = noopSecurity({
        $security: { allowOrigins: ['*'] },
      } as any)

      expect(sec.allowsOrigin('https://anywhere.example.net/x')).toBe(true)
    })
  })

  describe('`sanitizeProps`', () => {
    /**
     * Threat: `banProps` configured without the module — production would
     * spread attribute bags unfiltered while the config claims they are
     * banned.
     *
     * Measure: discovered intent fails closed — bags come back empty (which
     * also empties schema entries through `useSchema`, so the broken state is
     * unmissable rather than silently unprotected).
     *
     * Verified red→green: bags passed through in production before the
     * fail-closed change.
     */
    it('should empty attribute bags when banProps is configured', () => {
      prod()
      const sec = noopSecurity({
        $security: { banProps: ['style'] },
      } as any)

      expect(sec.sanitizeProps({ style: 'color: red', class: 'x' })).toEqual({})
    })

    /**
     * Threat: none — no intent, no filtering. Bags pass through unchanged
     * (attribute filtering is the module's feature).
     */
    it('should pass bags through when banProps is not configured', () => {
      prod()
      const sec = noopSecurity({ $security: {} } as any)
      const bag = { class: 'x' }

      expect(sec.sanitizeProps(bag)).toBe(bag)
    })
  })

  describe('ciphers', () => {
    /**
     * Threat: ciphers configured without the module — production would persist
     * autosave drafts in plaintext while the config claims they are encrypted.
     *
     * Measure: discovered intent fails closed — the noop ciphers throw, and
     * autosave's existing error handling turns that into "nothing persisted"
     * (encrypt) / "draft discarded" (decrypt) instead of plaintext storage.
     *
     * Verified red→green: the identity ciphers ran in production before the
     * fail-closed change.
     */
    it('should refuse to run when ciphers are configured', () => {
      prod()
      const sec = noopSecurity({
        $security: { encrypt: (v: string) => v, decrypt: (v: string) => v },
      } as any)

      expect(() => sec.encrypt('data', 'autosave:local')).toThrowError()
      expect(() => sec.decrypt('data', 'autosave:local')).toThrowError()
    })

    /**
     * Threat: none — plaintext is the documented default when no ciphers are
     * configured; identity is the correct behavior.
     */
    it('should stay identity when no ciphers are configured', () => {
      prod()
      const sec = noopSecurity({ $security: {} } as any)

      expect(sec.encrypt('data', 'autosave:local')).toBe('data')
      expect(sec.decrypt('data', 'autosave:local')).toBe('data')
    })
  })

  describe('`allowsHtml` and `allowsComponent`', () => {
    /**
     * Threat: `allowHtml` / `allowComponents` configured without the module —
     * in production the config would read as enforced policy while every area
     * renders raw and every name resolves.
     *
     * Measure: discovered intent fails closed — HTML renders escaped and
     * component names stop resolving until the module is registered.
     */
    it('should fail closed when configured', () => {
      prod()
      const sec = noopSecurity({
        $security: {
          allowHtml: ['content'],
          allowComponents: ['MyBadge'],
        },
      } as any)

      expect(sec.allowsHtml('content')).toBe(false)
      expect(sec.allowsComponent('MyBadge')).toBe(false)
    })

    /**
     * Threat: none — no intent means the module family's absent-feature rule
     * applies: everything is permitted, in production too.
     *
     * Verified red→green: the gates were unconditionally closed without the
     * module before the permissive redesign.
     */
    it('should stay permissive when not configured', () => {
      prod()
      const sec = noopSecurity({ $security: {} } as any)

      expect(sec.allowsHtml('content')).toBe(true)
      expect(sec.allowsHtml('slots')).toBe(true)
      expect(sec.allowsComponent('Anything')).toBe(true)
    })
  })

  describe('development stays permissive', () => {
    /**
     * Threat: none — the other half of the contract. In development the same
     * misconfigurations warn and stay permissive, so the app remains workable
     * while the console names the fix.
     */
    it('should warn and allow in development', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const sec = noopSecurity({
        $security: {
          allowOrigins: ['https://api.example.com'],
          banProps: ['style'],
        },
      } as any)

      const bag = { style: 'color: red' }

      expect(sec.allowsOrigin('https://evil.example.net/x')).toBe(true)
      expect(sec.sanitizeProps(bag)).toBe(bag)

      warn.mockRestore()
    })
  })
})
