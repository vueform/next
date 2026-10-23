import { defineSchema } from '@vueform/core'

/**
 * # Validation integrity
 *
 * Threat model: validation rules are declared in schema strings and executed
 * against end-user input. Client-side validation is UX, not a security boundary
 * — but it must not crash on hostile input (uncaught exceptions out of
 * `validate()`/`submit()`) and must not burn quadratic CPU on crafted values
 * (regex denial of service). Rule mechanics — pattern fidelity, tokenizing,
 * fail-closed malformed patterns — are covered by each rule's own suite in
 * `tests/integration/rules/`.
 */
import { createForm } from '../../helpers'

describe('Security: validation integrity', () => {
  describe('hostile values against regex rules', () => {
    /**
     * Threat: a hostile value shaped like a malformed regex (`/(/`) — under the
     * old code this compiled the value and threw an uncaught `SyntaxError` out
     * of `validate()`, a crash any form user could trigger.
     *
     * Measure: the value is never compiled; hostile values are just strings to
     * test.
     *
     * Verified red→green: this input crashed validation before the fix.
     */
    test('it should not crash on values shaped like malformed regexes', async () => {
      const { code } = createForm({
        schema: defineSchema({
          code: { type: 'text', rules: 'regex:/^[a-z]+$/' },
        }),
      })

      code.update('/(/')
      await expect(code.validate()).resolves.not.toThrow()
      expect(code.invalid).toBe(true)
    })
  })

  describe('rule name lookup', () => {
    /**
     * Threat: a schema rule name like `constructor` — inherited object keys
     * pass a truthiness check on the rules registry, and the bogus "rule"
     * crashes later with an opaque `TypeError` instead of a clear error.
     *
     * Measure: rule lookup is own-key only, so unknown (and inherited) names
     * produce the intended clear error.
     */
    test('it should reject `constructor` as a rule name with a clear error', async () => {
      expect(() =>
        createForm({
          schema: defineSchema({
            el: { type: 'text', rules: 'constructor' },
          }),
        })
      ).toThrowError('`constructor` validation rule does not exist')
    })
  })

  describe('regex denial of service', () => {
    /**
     * Threat: the `url` rule's userinfo group backtracks quadratically on
     * colon-heavy input — a form user pasting a crafted megabyte string would
     * freeze the tab on every keystroke's validation pass.
     *
     * Measure: a pre-regex length cap (8192 for URLs — long query strings stay
     * legitimate) bounds the work; oversized input simply fails.
     */
    test('it should reject oversized url input without pathological time', async () => {
      const { link } = createForm({
        schema: defineSchema({
          link: { type: 'text', rules: 'url' },
        }),
      })

      const hostile = '//' + ':'.repeat(50_000)

      const start = performance.now()
      link.update(hostile)
      await link.validate()
      const elapsed = performance.now() - start

      expect(link.invalid).toBe(true)
      expect(elapsed).toBeLessThan(1_000)
    })

    /**
     * Threat: the same class of backtracking in the email rule on
     * quote/dot-heavy input.
     *
     * Measure: capped at 320 characters — the RFC ceiling for an address is
     * 254, so no legitimate email is affected.
     */
    test('it should reject oversized email input without pathological time', async () => {
      const { mail } = createForm({
        schema: defineSchema({
          mail: { type: 'text', rules: 'email' },
        }),
      })

      const hostile = '"'.repeat(50_000) + '@example.com'

      const start = performance.now()
      mail.update(hostile)
      await mail.validate()
      const elapsed = performance.now() - start

      expect(mail.invalid).toBe(true)
      expect(elapsed).toBeLessThan(1_000)
    })

    /**
     * Threat: the ipv6 rule's zone-id tail backtracks quadratically on crafted
     * input, like its siblings.
     *
     * Measure: capped at 64 characters — the longest textual IPv6 form with a
     * zone id fits comfortably — so oversized input fails immediately.
     */
    test('it should reject oversized ipv6 input without pathological time', async () => {
      const { ip } = createForm({
        schema: defineSchema({
          ip: { type: 'text', rules: 'ipv6' },
        }),
      })

      const hostile = '::' + ':'.repeat(50_000) + '%eth0'

      const start = performance.now()
      ip.update(hostile)
      await ip.validate()
      const elapsed = performance.now() - start

      expect(ip.invalid).toBe(true)
      expect(elapsed).toBeLessThan(1_000)

      ip.update('2001:db8::8a2e:370:7334')
      await ip.validate()
      expect(ip.invalid).toBe(false)
    })

    /**
     * Threat: over-blocking — the caps must sit far above anything legitimate.
     *
     * Measure: ordinary values still validate correctly under the caps.
     */
    test('it should keep validating ordinary values under the caps', async () => {
      const { link, mail } = createForm({
        schema: defineSchema({
          link: { type: 'text', rules: 'url' },
          mail: { type: 'text', rules: 'email' },
        }),
      })

      link.update('https://example.com/path?q=' + 'a'.repeat(2_000))
      await link.validate()
      expect(link.invalid).toBe(false)

      mail.update('someone@example.com')
      await mail.validate()
      expect(mail.invalid).toBe(false)
    })
  })
})
