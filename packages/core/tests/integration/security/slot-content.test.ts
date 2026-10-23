import { defineSchema } from '@vueform/core'
import dompurify from '@vueform/dompurify'
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

const Resolved: FunctionalComponent = () =>
  h('span', { class: 'resolved' }, 'Resolved')
Resolved.inheritAttrs = false

const withComponents = { global: { components: { Resolved } } }

describe('Security: slot content', () => {
  describe('HTML in a restricted app renders escaped', () => {
    /**
     * Threat: an HTML payload in a slot string of an app that restricted HTML
     * rendering — `allowHtml` is set and `'slots'` isn't in it.
     *
     * Measure: once `allowHtml` is configured it is a pure allowlist, so the
     * string renders as escaped text (tags visible, nothing silently
     * dropped).
     */
    test('it should render an HTML slot string as escaped text when `allowHtml` omits `slots`', async () => {
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
})
