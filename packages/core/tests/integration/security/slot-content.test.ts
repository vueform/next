/**
 * # Slot content
 *
 * Threat model: `slots`, `template`, and `layout` entries arrive with the
 * schema, which may come from a CMS, a form builder, or any other semi-trusted
 * source. A string entry can be plain text, HTML, or a component name — and a
 * crafted schema must be able to do exactly none of the following: execute
 * script, register event handlers, mount components that were never offered to
 * schemas, or render unsanitized HTML. The guarantees proven here: plain text
 * always renders escaped; HTML renders only through `$security.allowHtml:
 * ['slots']` with the sanitizer applied after expression resolution; component
 * names resolve only through the `$security.allowComponents` allowlist; and
 * even a string that survives those gates cannot rebuild `<script>` elements or
 * inline `on*` handlers.
 */
import { h, nextTick, type FunctionalComponent } from 'vue'
import { createForm } from '../../helpers'
import { defineSchema } from '#core'
import * as modules from '#core/modules'
import dompurify from '#dompurify'

const Resolved: FunctionalComponent = () =>
  h('span', { class: 'resolved' }, 'Resolved')
Resolved.inheritAttrs = false

const withComponents = { global: { components: { Resolved } } }

// Forms built without the security module observe the inert noop surface.
const { security: _security, ...modulesWithoutSecurity } = modules as any

describe('Security: slot content', () => {
  describe('plain text always renders, escaped', () => {
    /**
     * Threat: none — this is the safe baseline. Plain text in a slot is
     * ordinary content; gating it would only push users toward broader
     * opt-ins.
     *
     * Measure: text renders through Vue's escaping with no configuration at all
     * — no `allowHtml`, no sanitizer, not even the security module.
     */
    test('it should render a plain text slot string with no security config', async () => {
      const { form } = createForm(
        {
          schema: defineSchema({
            el: {
              type: 'text',
              label: 'Foo',
              slots: { label: 'Custom label' },
            },
          }),
        },
        { $security: {} }
      )

      await nextTick()

      expect(form.find('.vf-label-group').text()).toBe('Custom label')
    })

    /**
     * Threat: an HTML payload in a slot string of an app that never opted into
     * HTML rendering — the most common deployment.
     *
     * Measure: without `allowHtml: ['slots']` the string renders as escaped
     * text (tags visible, nothing silently dropped) with a dev warning naming
     * the missing option.
     */
    test('it should render an HTML slot string as escaped text without `allowHtml`', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const { form } = createForm(
        {
          schema: defineSchema({
            el: {
              type: 'text',
              label: 'Foo',
              slots: { label: '<img src=x onerror="window.__slot1 = true">' },
            },
          }),
        },
        { $security: { allowHtml: [] } }
      )

      await nextTick()

      expect(form.find('.vf-label-group img').exists()).toBe(false)
      expect(form.find('.vf-label-group').text()).toContain('<img')
      expect((window as any).__slot1).toBeUndefined()

      warn.mockRestore()
    })
  })

  describe('HTML slot strings are sanitized', () => {
    /**
     * Threat: a schema slot carrying `<script>` — direct script injection from
     * schema data.
     *
     * Measure: with `allowHtml: ['slots']` and DOMPurify installed, the script
     * tag is stripped before rendering. (Migrated from the original suite; the
     * gate names changed, the guarantee did not.)
     */
    test('it should strip script tags from string slots', async () => {
      const { form } = createForm(
        {
          schema: defineSchema({
            el: {
              type: 'text',
              label: 'Foo',
              slots: {
                label: '<span>Hello</span><script>alert("xss")</script>',
              },
            },
          }),
        },
        {
          plugins: [dompurify()],
          $security: { sanitizer: undefined, allowHtml: ['slots'] },
        }
      )

      await nextTick()

      const slot = form.find('.vf-label-group span')
      expect(slot.exists()).toBe(true)
      expect(slot.html()).not.toContain('<script>')
      expect(slot.html()).not.toContain('alert')
      expect(slot.text()).toContain('Hello')
    })

    /**
     * Threat: event-handler attributes riding in on otherwise plausible markup
     * (`<img onerror=…>`).
     *
     * Measure: the sanitizer strips `on*` attributes before the string reaches
     * the DOM. (Migrated from the original suite.)
     */
    test('it should strip onerror attributes from string slots', async () => {
      const { form } = createForm(
        {
          schema: defineSchema({
            el: {
              type: 'text',
              label: 'Foo',
              slots: { label: '<img src="x" onerror="alert(1)">' },
            },
          }),
        },
        {
          plugins: [dompurify()],
          $security: { sanitizer: undefined, allowHtml: ['slots'] },
        }
      )

      await nextTick()

      const slot = form.find('.vf-label-group')
      expect(slot.html()).not.toContain('onerror')
    })

    /**
     * Threat: over-blocking — a sanitizer that also destroys legitimate
     * formatting would push users to turn it off.
     *
     * Measure: safe markup passes through intact. (Migrated from the original
     * suite.)
     */
    test('it should preserve safe HTML in string slots', async () => {
      const { form } = createForm(
        {
          schema: defineSchema({
            el: {
              type: 'text',
              label: 'Foo',
              slots: { label: '<em class="highlight">Important</em>' },
            },
          }),
        },
        {
          plugins: [dompurify()],
          $security: { sanitizer: undefined, allowHtml: ['slots'] },
        }
      )

      await nextTick()

      const slot = form.find('.vf-label-group em.highlight')
      expect(slot.exists()).toBe(true)
      expect(slot.text()).toBe('Important')
    })
  })

  describe('the rebuilt-element branch is hardened even without a sanitizer', () => {
    /**
     * Threat: with the explicit `sanitizer: (html: string) => html` opt-out
     * (trusted-schema apps), a slot string like `<script>…</script>` would be
     * rebuilt via `h('script', { innerHTML })` — and a script element created
     * that way EXECUTES on insertion, unlike scripts arriving through innerHTML
     * parsing, which the HTML spec keeps inert.
     *
     * Measure: dangerous tag names (`script`, `iframe`, `style`, `meta`, …)
     * never take the rebuild path; the content falls back to the inert
     * `innerHTML` branch, where the HTML spec forbids script execution (a
     * script _node_ may exist in the DOM, but it can never run).
     */
    test('it should never execute a script element from a slot string', async () => {
      const { form } = createForm(
        {
          schema: defineSchema({
            el: {
              type: 'text',
              label: 'Foo',
              slots: { label: '<script>window.__slot2 = true</script>' },
            },
          }),
        },
        {
          $security: {
            allowHtml: ['slots'],
            sanitizer: (html: string) => html,
          },
        }
      )

      await nextTick()

      expect((window as any).__slot2).toBeUndefined()
      // The rebuild path would have made this an executing element; the
      // fallback leaves at most an inert parsed node.
      expect(form.find('.vf-label-group').exists()).toBe(true)
    })

    /**
     * Threat: none — the opt-out contract. Under the identity-sanitizer opt-out
     * the app declared its schemas trusted, and slot HTML renders exactly as
     * authored — inline handlers included, the same behavior the markup would
     * have anywhere else in the app. With an engine installed, `on*` attributes
     * never survive sanitization (proven above).
     */
    test('it should render raw HTML as authored under the identity opt-out', async () => {
      const { form } = createForm(
        {
          schema: defineSchema({
            el: {
              type: 'text',
              label: 'Foo',
              slots: {
                label:
                  '<div class="ok" onclick="window.__slot3 = true">x</div>',
              },
            },
          }),
        },
        {
          $security: {
            allowHtml: ['slots'],
            sanitizer: (html: string) => html,
          },
        }
      )

      await nextTick()

      const div = form.find('.vf-label-group div.ok')
      expect(div.exists()).toBe(true)
      expect(div.attributes('onclick')).toBe('window.__slot3 = true')
    })

    /**
     * Threat: none — a scope boundary. `banProps` governs prop **bags**
     * (`parts`, cell `attrs`, schema entries); slot HTML is governed solely by
     * the sanitizer's policy (`sanitizeOptions: { FORBID_ATTR: [...] }` for
     * attribute bans inside sanitized HTML).
     *
     * Measure: a `banProps` entry does not reach into slot markup — the HTML
     * renders per the sanitizer's verdict, `style` attribute included.
     */
    test('it should not apply `banProps` to slot HTML', async () => {
      const { form } = createForm(
        {
          schema: defineSchema({
            el: {
              type: 'text',
              label: 'Foo',
              slots: {
                label: '<div class="ok" style="color: red">x</div>',
              },
            },
          }),
        },
        {
          $security: {
            allowHtml: ['slots'],
            sanitizer: (html: string) => html,
            banProps: ['style'],
          },
        }
      )

      await nextTick()

      expect(form.find('.vf-label-group div.ok').attributes('style')).toContain(
        'color: red'
      )
    })

    /**
     * Threat: expression-injected attribute breakout — the schema template
     * `<div title="{note}">` is clean, and the form user supplies `"
     * onclick="…` as the field value to fabricate a handler attribute in the
     * re-parsed attribute text.
     *
     * Measure: post-resolution sanitization — the engine sees the final bytes
     * (fabricated attribute included) and strips the handler.
     *
     * Verified red→green: the handler attribute reached the DOM before the
     * hardening.
     */
    test('it should not turn expression-resolved form data into handler attributes', async () => {
      const { form } = createForm(
        {
          schema: defineSchema({
            note: { type: 'text', default: '" onclick="window.__slot4 = true' },
            el: {
              type: 'text',
              label: 'Foo',
              slots: { label: '<div title="{note}">x</div>' },
            },
          }),
        },
        {
          plugins: [dompurify()],
          $security: {
            allowHtml: ['slots'],
            sanitizer: undefined,
          },
        }
      )

      await nextTick()

      expect(form.find('.vf-label-group [onclick]').exists()).toBe(false)
      expect((window as any).__slot4).toBeUndefined()
    })
  })

  describe('component names resolve only through `allowComponents`', () => {
    /**
     * Threat: a schema mounting any globally registered component — admin
     * panels, router links, anything never meant to be reachable from a form
     * definition.
     *
     * Measure: only strings shaped like a component name (PascalCase or
     * kebab-case) consult the `$security.allowComponents` gate at all; an
     * unlisted shaped name renders as text — with the gate's once-per-name dev
     * warning — never as the component.
     */
    test('it should render an unlisted component name as text', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const { form } = createForm(
        {
          schema: defineSchema({
            el: { type: 'text', label: 'Foo', slots: { label: 'Resolved' } },
          }),
        },
        { $security: {} },
        withComponents
      )

      await nextTick()

      expect(form.find('.resolved').exists()).toBe(false)
      expect(form.find('.vf-label-group').text()).toContain('Resolved')
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('will not resolve to a registered component')
      )

      warn.mockRestore()
    })

    /**
     * Threat: none — the positive path. An allowlisted name is part of the
     * schema vocabulary the app deliberately exposed.
     *
     * Measure: listed names resolve to the registered component.
     */
    test('it should resolve a component name listed in `allowComponents`', async () => {
      const { form } = createForm(
        {
          schema: defineSchema({
            el: { type: 'text', label: 'Foo', slots: { label: 'Resolved' } },
          }),
        },
        { $security: { allowComponents: ['Resolved'] } },
        withComponents
      )

      await nextTick()

      expect(form.find('.resolved').text()).toBe('Resolved')
    })

    /**
     * Threat: warning fatigue — a rejected name repeated across dozens of
     * elements flooding the console would train developers to ignore security
     * warnings entirely.
     *
     * Measure: each rejected name warns once per instance, no matter how many
     * elements use it. (Migrated from the original suite.)
     */
    test('it should warn once per rejected name across elements', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      createForm(
        {
          schema: defineSchema({
            a: { type: 'text', label: 'A', template: 'Resolved' },
            b: { type: 'text', label: 'B', template: 'Resolved' },
          }),
        },
        { $security: {} },
        withComponents
      )

      await nextTick()

      const hits = warn.mock.calls.filter((call) =>
        String(call[0]).includes('`Resolved` is not listed')
      )
      expect(hits).toHaveLength(1)

      warn.mockRestore()
    })

    /**
     * Threat: a `template` prop string mounting an unlisted component — the
     * same vector as slots, through a different prop.
     *
     * Measure: the `template` prop's string form goes through the same
     * allowlist. (Migrated from the original suite.)
     */
    test('it should gate a string `template` prop by `allowComponents`', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const rejected = createForm(
        {
          schema: defineSchema({
            el: { type: 'text', label: 'Foo', template: 'Resolved' },
          }),
        },
        { $security: {} },
        withComponents
      )

      await nextTick()

      expect(rejected.form.find('.resolved').exists()).toBe(false)
      expect(rejected.form.find('input').exists()).toBe(true)
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining(
          '`Resolved` is not listed in `$security.allowComponents`'
        )
      )

      const allowed = createForm(
        {
          schema: defineSchema({
            el: { type: 'text', label: 'Foo', template: 'Resolved' },
          }),
        },
        { $security: { allowComponents: ['Resolved'] } },
        withComponents
      )

      await nextTick()

      expect(allowed.form.find('.resolved').exists()).toBe(true)
      expect(allowed.form.find('input').exists()).toBe(false)

      warn.mockRestore()
    })

    /**
     * Threat: the `layout` prop string — the third component-name doorway.
     *
     * Measure: same allowlist. (Migrated from the original suite.)
     */
    test('it should gate a string `layout` prop by `allowComponents`', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const rejected = createForm(
        {
          schema: defineSchema({
            el: { type: 'text', label: 'Foo', layout: 'Resolved' },
          }),
        },
        { $security: {} },
        withComponents
      )

      await nextTick()

      expect(rejected.form.find('.resolved').exists()).toBe(false)
      expect(rejected.form.find('.vf-label').text()).toBe('Foo')

      const allowed = createForm(
        {
          schema: defineSchema({
            el: { type: 'text', label: 'Foo', layout: 'Resolved' },
          }),
        },
        { $security: { allowComponents: ['Resolved'] } },
        withComponents
      )

      await nextTick()

      expect(allowed.form.find('.resolved').exists()).toBe(true)
      expect(allowed.form.find('.vf-label').exists()).toBe(false)

      warn.mockRestore()
    })
  })

  describe('without the security module', () => {
    /**
     * Threat: none — the module family's contract. An absent module means the
     * feature is absent: `validation` absent counts everything valid,
     * `security` absent enforces nothing. Deliberately omitting the module is
     * the documented wholesale opt-out for trusted environments.
     *
     * Measure: with no `$security` intent configured, HTML slot strings render
     * as raw HTML (no engine, no gate) — while the string renderer's structural
     * floors (inert `<script>` handling, parsed `on*` drops) still apply, since
     * they are invariants, not policy.
     */
    test('it should render HTML slot strings permissively without the module', async () => {
      const { form } = createForm(
        {
          schema: defineSchema({
            el: {
              type: 'text',
              label: 'Foo',
              slots: { label: '<b>bold</b>' },
            },
          }),
        },
        {
          modules: modulesWithoutSecurity,
          $security: {},
        }
      )

      await nextTick()

      expect(form.find('.vf-label-group b').exists()).toBe(true)
      expect(form.find('.vf-label-group b').text()).toBe('bold')
    })

    /**
     * Threat: `allowHtml` configured without the module — a config that reads
     * like policy while nothing enforces it.
     *
     * Measure: discovered intent stays permissive in development (and stays
     * permissive so the app remains workable); production fails closed instead
     * — proven in the noop production suite.
     */
    test('it should warn when `allowHtml` is configured without the module', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const { form } = createForm(
        {
          schema: defineSchema({
            el: {
              type: 'text',
              label: 'Foo',
              slots: { label: '<b>bold</b>' },
            },
          }),
        },
        {
          modules: modulesWithoutSecurity,
          $security: { allowHtml: ['slots'] },
        }
      )

      await nextTick()

      expect(form.find('.vf-label-group b').exists()).toBe(true)
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining(
          '`$security` options are configured but the `security` module is not registered'
        )
      )

      warn.mockRestore()
    })

    /**
     * Threat: none — permissive component resolution without the module. Any
     * **registered** component name resolves; the registration guard keeps
     * one-word text slots (`'Hello'`) rendering as text instead of becoming
     * unresolvable elements.
     */
    test('it should resolve registered component names without the module', async () => {
      const { form } = createForm(
        {
          schema: defineSchema({
            el: {
              type: 'text',
              label: 'Foo',
              slots: { label: 'Resolved' },
            },
          }),
        },
        {
          modules: modulesWithoutSecurity,
          $security: {},
        },
        withComponents
      )

      await nextTick()

      expect(form.find('.resolved').exists()).toBe(true)
    })

    /**
     * Threat: over-resolution — a permissive gate turning ordinary text into
     * component lookups.
     *
     * Measure: a component-shaped slot string that matches no registered
     * component renders as text, module or no module.
     */
    test('it should render unregistered component-shaped strings as text', async () => {
      const { form } = createForm(
        {
          schema: defineSchema({
            el: {
              type: 'text',
              label: 'Foo',
              slots: { label: 'Hello' },
            },
          }),
        },
        {
          modules: modulesWithoutSecurity,
          $security: {},
        }
      )

      await nextTick()

      expect(form.find('.vf-label-group').text()).toContain('Hello')
      expect(form.find('hello').exists()).toBe(false)
    })

    /**
     * Threat: `allowComponents` configured without the module — policy without
     * an enforcer.
     *
     * Measure: discovered intent stays permissive in development while
     * resolution stays permissive; production fails closed — proven in the noop
     * production suite.
     */
    test('it should warn when `allowComponents` is configured without the module', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const { form } = createForm(
        {
          schema: defineSchema({
            el: { type: 'text', label: 'Foo', template: 'Resolved' },
          }),
        },
        {
          modules: modulesWithoutSecurity,
          $security: { allowComponents: ['Resolved'] },
        },
        withComponents
      )

      await nextTick()

      expect(form.find('.resolved').exists()).toBe(true)
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining(
          '`$security` options are configured but the `security` module is not registered'
        )
      )

      warn.mockRestore()
    })
  })
})
