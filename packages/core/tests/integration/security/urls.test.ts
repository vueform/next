/**
 * # URL scheme validation
 *
 * Threat model: several props end up in navigation sinks — `redirect` in
 * `window.location.href`, button `href`/`to` in an `<a href>` attribute, and
 * file item `url`s (which come back from upload servers) in download links. All
 * of them accept schema strings, and the first two resolve `{expression}`
 * templates against live form data — so a `javascript:` URL can arrive from a
 * schema directly or be typed by an end user into a field a template
 * references. Assigning such a URL executes script in the page's origin. The
 * guarantee: every URL sink validates the FINAL value's scheme, and rejects
 * obfuscations (embedded tabs/newlines) the way browsers would forgive them.
 */
import { nextTick } from 'vue'
import { createForm, flushPromises } from '../../helpers'
import { defineSchema } from '#core'
import * as modules from '#core/modules'

// Forms built without the security module observe the permissive surface.
const { security: _security, ...modulesWithoutSecurity } = modules as any

describe('Security: URL scheme validation', () => {
  describe('button `href` and `to`', () => {
    /**
     * Threat: schema `href: 'javascript:…'` — a clickable script link from pure
     * schema data. `to` is equally dangerous: it lands in the same `href`
     * attribute (middle-click and copy-link bypass the click handler).
     *
     * Measure: both props are scheme-validated; unsafe schemes resolve to
     * `undefined`, so no `href` attribute is rendered at all.
     *
     * Verified red→green: the `javascript:` href rendered before the fix.
     */
    test('it should drop `javascript:` URLs from button href and to', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const { form } = createForm({
        schema: defineSchema({
          a: {
            type: 'button',
            text: 'Href',
            href: 'javascript:window.__url1 = true',
          },
          b: {
            type: 'button',
            text: 'To',
            to: 'javascript:window.__url1 = true',
          } as any,
        }),
      })

      await nextTick()

      expect(form.find('[href^="javascript"]').exists()).toBe(false)
      expect((window as any).__url1).toBeUndefined()

      warn.mockRestore()
    })

    /**
     * Threat: scheme obfuscation — browsers strip tab/newline/carriage returns
     * inside URLs, so `java\tscript:` executes even though a naive prefix check
     * misses it.
     *
     * Measure: validation removes those characters before scheme detection,
     * mirroring browser parsing.
     */
    test('it should reject tab-obfuscated javascript URLs', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const { form } = createForm({
        schema: defineSchema({
          a: {
            type: 'button',
            text: 'Href',
            href: 'java\tscript:window.__url2 = true',
          },
        }),
      })

      await nextTick()

      // The dropped href demotes the element from `<a>` back to `<button>`.
      expect(form.find('a').exists()).toBe(false)
      expect((window as any).__url2).toBeUndefined()

      warn.mockRestore()
    })

    /**
     * Threat: over-blocking — navigation and contact links are the reason the
     * props exist.
     *
     * Measure: `https:`, relative URLs, `mailto:` and `tel:` all pass.
     */
    test('it should keep https, relative, mailto and tel button URLs', async () => {
      const { form } = createForm({
        schema: defineSchema({
          a: { type: 'button', text: 'A', href: 'https://example.com/x' },
          b: { type: 'button', text: 'B', href: '/relative/path' },
          c: { type: 'button', text: 'C', href: 'mailto:hi@example.com' },
          d: { type: 'button', text: 'D', href: 'tel:+3611234567' },
        }),
      })

      await nextTick()

      const hrefs = form.findAll('a').map((a) => a.attributes('href'))
      expect(hrefs).toContain('https://example.com/x')
      expect(hrefs).toContain('/relative/path')
      expect(hrefs).toContain('mailto:hi@example.com')
      expect(hrefs).toContain('tel:+3611234567')
    })

    /**
     * Threat: the expression vector — schema `href: '{link}'` with the end user
     * typing a `javascript:` URL into the `link` field.
     *
     * Measure: validation runs on the resolved value, after expression
     * substitution.
     */
    test('it should validate the resolved value of an expression href', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const { form } = createForm({
        schema: defineSchema({
          link: { type: 'text', default: 'javascript:window.__url3 = true' },
          a: { type: 'button', text: 'Go', href: '{link}' },
        }),
      })

      await nextTick()

      expect(form.find('[href^="javascript"]').exists()).toBe(false)
      expect((window as any).__url3).toBeUndefined()

      warn.mockRestore()
    })
  })

  describe('`redirect` after submit', () => {
    /**
     * Threat: schema `redirect: 'javascript:…'` (or the classic `redirect:
     * '{returnUrl}'` with a query-prefilled hidden field) — script execution
     * via `window.location.href` on successful submit.
     *
     * Measure: the final resolved redirect value must be `http:`/`https:` or
     * relative before it reaches `location.href`; anything else is dropped with
     * a warning and no navigation happens.
     *
     * Verified red→green: `location.href` received the raw value before the
     * fix.
     */
    test('it should not navigate to a `javascript:` redirect', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const responder = async () =>
        ({
          data: { ok: true },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {},
        }) as any

      const { form$ } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', default: 'x' },
          }),
          endpoint: '/submit',
          redirect: 'javascript:window.__url4 = true',
        },
        { $http: { adapter: responder } }
      )

      const before = window.location.href

      await form$.submit()
      await flushPromises()
      await nextTick()
      await flushPromises()

      expect((window as any).__url4).toBeUndefined()
      expect(window.location.href).toBe(before)
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('disallowed scheme'),
        expect.anything()
      )

      warn.mockRestore()
    })
  })

  describe('file item URLs', () => {
    /**
     * Threat: a compromised (or simply hostile) upload endpoint returning
     * `{"url": "javascript:…"}` — the file list renders that URL as a clickable
     * link.
     *
     * Measure: file item URLs are validated when the model value is turned into
     * list items; `blob:` stays allowed for local previews.
     *
     * Verified red→green: the link rendered with the `javascript:` href before
     * the fix.
     */
    test('it should drop `javascript:` file URLs from server data', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const { form } = createForm({
        schema: defineSchema({
          f: {
            type: 'file',
            default: [
              { name: 'evil.pdf', url: 'javascript:window.__url5 = true' },
              { name: 'fine.pdf', url: 'https://example.com/fine.pdf' },
            ],
          } as any,
        }),
      })

      await nextTick()

      expect(form.find('[href^="javascript"]').exists()).toBe(false)
      expect(form.find('[href="https://example.com/fine.pdf"]').exists()).toBe(
        true
      )
      expect((window as any).__url5).toBeUndefined()

      warn.mockRestore()
    })
  })

  describe('without the security module', () => {
    /**
     * Threat: none — the module boundary. URL scheme checking is the security
     * module's `sanitizeUrl` capability: deliberately omitting the module opts
     * out of it like every other protection, so scheme-bearing URLs reach their
     * sinks unchecked.
     */
    test('it should leave URL schemes unchecked without the module', async () => {
      const { form } = createForm(
        {
          schema: defineSchema({
            btn: {
              type: 'button',
              text: 'Go',
              href: 'javascript:void(0)',
            } as any,
          }),
        },
        { modules: modulesWithoutSecurity, $security: {} }
      )

      await nextTick()

      expect(form.find('a').attributes('href')).toBe('javascript:void(0)')
    })
  })
})
