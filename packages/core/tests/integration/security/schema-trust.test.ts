/**
 * # Untrusted-schema containment
 *
 * Threat model: the form schema is a JSON document from a semi-trusted source
 * (CMS, form builder, database). It legitimately describes elements, labels,
 * and layout — and must not be able to do anything else: no mounting of
 * arbitrary registered components, no HTML sinks through attribute bags.
 * `innerHTML`/`outerHTML` and prototype keys are blocked unconditionally;
 * inline event handlers and other channels are the app's policy via
 * `$security.banProps` (documented hardening baseline: `[/^on/i, 'srcdoc']`).
 * Functions cannot travel through JSON, so function-valued props remain the
 * developer-code trust boundary.
 */
import { defineComponent, h, nextTick, type FunctionalComponent } from 'vue'

import { defineSchema } from '#core'
import * as modules from '#core/modules'

import { createForm, mountApp } from '../../helpers'

// Forms built without the security module observe the inert noop surface.
const { security: _security, ...modulesWithoutSecurity } = modules as any

const Leaked: FunctionalComponent = () =>
  h('span', { class: 'leaked' }, 'Leaked')
Leaked.inheritAttrs = false

const withComponents = { global: { components: { Leaked } } }

describe('Security: untrusted-schema containment', () => {
  describe('schema `component` strings are gated', () => {
    /**
     * Threat: `{"x": {"component": "AdminPanel", ...}}` — an untrusted schema
     * mounting any globally registered component with attacker-chosen props.
     *
     * Measure: an explicit `component` name string resolves only through
     * `$security.allowComponents`; on rejection the entry falls back to the
     * `Vf*` element derived from its `type`.
     *
     * Verified red→green: before the gate, the schema mounted the component.
     */
    test('it should not mount an unlisted `component` string from a schema', async () => {
      const { form } = createForm(
        {
          schema: defineSchema({
            el: { type: 'text', component: 'Leaked', label: 'Foo' } as any,
          }),
        },
        { $security: {} },
        withComponents
      )

      await nextTick()

      expect(form.find('.leaked').exists()).toBe(false)
      // Fallback: the entry renders as its `type` (a text element).
      expect(form.find('input').exists()).toBe(true)
    })

    /**
     * Threat: none — the positive path for apps that deliberately expose a
     * component vocabulary to schema authors.
     *
     * Measure: listed names mount; the allowlist is the contract.
     */
    test('it should mount a `component` string listed in `allowComponents`', async () => {
      const { form } = createForm(
        {
          schema: defineSchema({
            el: { type: 'text', component: 'Leaked', label: 'Foo' } as any,
          }),
        },
        { $security: { allowComponents: ['Leaked'] } },
        withComponents
      )

      await nextTick()

      expect(form.find('.leaked').exists()).toBe(true)
    })

    /**
     * Threat: an entry with a rejected `component` and no `type` would
     * otherwise render a nonsense component name.
     *
     * Measure: the entry is skipped entirely with a dev warning.
     */
    test('it should skip an entry with a rejected component and no type', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const { form } = createForm(
        {
          schema: defineSchema({
            el: { component: 'Leaked', label: 'Foo' } as any,
          }),
        },
        { $security: {} },
        withComponents
      )

      await nextTick()

      expect(form.find('.leaked').exists()).toBe(false)
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('no usable `component` and no `type`')
      )

      warn.mockRestore()
    })

    /**
     * Threat: none — the derived element vocabulary must keep working with zero
     * configuration, or the gate would break every form.
     *
     * Measure: `Vf*` names derived from `type` are exempt from the allowlist.
     */
    test('it should keep rendering `type`-derived elements with no allowlist', async () => {
      const { form } = createForm(
        {
          schema: defineSchema({
            el: { type: 'text', label: 'Foo' },
          }),
        },
        { $security: {} }
      )

      await nextTick()

      expect(form.find('input').exists()).toBe(true)
    })
  })

  describe('`parts` attribute bags are filtered', () => {
    /**
     * Threat: `parts: { input: { onclick: '…' } }` — schema JSON planting a
     * string-valued inline handler that Vue would set via `setAttribute`,
     * creating live script from pure data.
     *
     * Measure: inline handlers are the app's policy — a `banProps` RegExp entry
     * (`/^on/i`, the documented hardening baseline) strips `on*` keys from
     * every parts source before the `v-bind` spread, with a dev warning naming
     * the dropped key.
     */
    test('it should strip on* keys from `parts` with a banProps pattern', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const { form } = createForm(
        {
          schema: defineSchema({
            el: {
              type: 'text',
              label: 'Foo',
              parts: { input: { onclick: 'window.__schema1 = true' } } as any,
            },
          }),
        },
        { $security: { banProps: [/^on/i] } }
      )

      await nextTick()

      const input = form.find('input')
      expect(input.attributes('onclick')).toBeUndefined()

      input.element.dispatchEvent(new Event('click'))
      expect((window as any).__schema1).toBeUndefined()

      expect(warn).toHaveBeenCalledWith(expect.stringContaining('`onclick`'))

      warn.mockRestore()
    })

    /**
     * Threat: kebab-case bypass — Vue camelizes spread keys when matching a
     * component's declared props, so an `on-label` schema key reaches an
     * `onLabel` prop even though the ban was written against the camelCase
     * spelling.
     *
     * Measure: bans match both the original key and its camelized form.
     *
     * Verified red→green: the kebab spelling passed the filter before the
     * camelized-form check.
     */
    test('it should ban the kebab-case spelling of a banned prop', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const { form } = createForm(
        {
          schema: defineSchema({
            el: {
              type: 'text',
              label: 'Foo',
              parts: { input: { 'on-click': 'window.__kebab1 = true' } } as any,
            },
          }),
        },
        { $security: { banProps: [/^on/i] } }
      )

      await nextTick()

      expect(form.find('input').attributes('on-click')).toBeUndefined()
      expect((window as any).__kebab1).toBeUndefined()
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('`on-click`'))

      warn.mockRestore()
    })

    /**
     * Threat: without a `banProps` policy, an app might assume inline handlers
     * are still blocked by a built-in `on*` rule.
     *
     * Measure: only `innerHTML`/`outerHTML` and prototype keys are built in —
     * an `onclick` string passes through unless the app configures `banProps`.
     * This test pins the deliberate default so a future change is a conscious
     * one.
     */
    test('it should pass on* keys through without a banProps policy', async () => {
      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'text',
            label: 'Foo',
            parts: { input: { onclick: '__unblocked' } } as any,
          },
        }),
      })

      await nextTick()

      expect(form.find('input').attributes('onclick')).toBe('__unblocked')
    })

    /**
     * Threat: `parts: { input: { innerHTML: '<img onerror=…>' } }` — an
     * attribute bag as an HTML sink (Vue treats an `innerHTML` key as a DOM
     * property assignment).
     *
     * Measure: `innerHTML`/`outerHTML` keys never survive the filter.
     */
    test('it should strip innerHTML keys from `parts`', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'button',
            text: 'Go',
            parts: {
              button: {
                innerHTML: '<img src=x onerror="window.__schema2 = true">',
              },
            } as any,
          },
        }),
      })

      await nextTick()

      expect(form.find('button img').exists()).toBe(false)
      expect(form.html()).not.toContain('onerror')
      expect((window as any).__schema2).toBeUndefined()

      warn.mockRestore()
    })

    /**
     * Threat: `$security.banProps` escalation — a schema attr bag carrying a
     * `style` entry. Inline styles can't inject selectors, but they can plant
     * tracking beacons (`background: url(//evil/?probe)`) and reposition the
     * element over other UI (`position: fixed` overlay redressing). Unlike
     * `on*` handlers, both the string form and the object form are
     * JSON-expressible, so a value-type test alone can't close the vector.
     *
     * Measure: keys listed in `$security.banProps` are dropped in **every**
     * value form — string and object alike — from attribute bags.
     *
     * Verified red→green: both forms reached the DOM before `banProps`
     * enforcement landed.
     */
    test('it should drop `banProps` keys in every value form from `parts`', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const { form } = createForm(
        {
          schema: defineSchema({
            a: {
              type: 'button',
              text: 'Go',
              parts: {
                button: {
                  style: 'position:fixed;inset:0;background:url(//evil/?probe)',
                },
              } as any,
            },
            b: {
              type: 'button',
              text: 'Go',
              parts: {
                button: {
                  style: {
                    position: 'fixed',
                    background: 'url(//evil/?probe)',
                  },
                },
              } as any,
            },
          }),
        },
        { $security: { banProps: ['style'] } }
      )

      await nextTick()

      for (const button of form.findAll('button')) {
        expect(button.attributes('style')).toBeUndefined()
      }
      expect(form.html()).not.toContain('evil')

      warn.mockRestore()
    })

    /**
     * Threat: over-blocking — without the `banProps: ['style']` escalation,
     * style bindings in `parts` are ordinary developer-facing Vue API (both the
     * string and the object form) and must keep working, or the filter taxes
     * every app for a presentation-severity vector that hardened apps opt into
     * closing.
     *
     * Measure: `style` is not on the built-in denylist; unlisted, it passes in
     * both forms.
     */
    test('it should keep style bindings when `style` is not in `banProps`', async () => {
      const { form } = createForm({
        schema: defineSchema({
          a: {
            type: 'button',
            text: 'Go',
            parts: { button: { style: { color: 'red' } } } as any,
          },
          b: {
            type: 'button',
            text: 'Go',
            parts: { button: { style: 'color: blue' } } as any,
          },
        }),
      })

      await nextTick()

      const [a, b] = form.findAll('button')
      expect(a.attributes('style')).toContain('color: red')
      expect(b.attributes('style')).toContain('color: blue')
    })

    /**
     * Threat: a misread of `banProps` as the whole policy — if listing extra
     * keys could somehow stand in for the built-in denylist, a configured app
     * might weaken the core guarantees.
     *
     * Measure: the built-in denylist (`innerHTML`/`outerHTML`, prototype keys)
     * applies always and is not relaxable; `banProps` only ever adds to it.
     */
    test('it should keep the built-in denylist with `banProps` configured', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const { form } = createForm(
        {
          schema: defineSchema({
            el: {
              type: 'button',
              text: 'Go',
              parts: {
                button: {
                  innerHTML: '<img src=x onerror="window.__ban1 = true">',
                },
              } as any,
            },
          }),
        },
        { $security: { banProps: ['data-x'] } }
      )

      await nextTick()

      expect(form.find('button img').exists()).toBe(false)
      expect((window as any).__ban1).toBeUndefined()

      warn.mockRestore()
    })

    /**
     * Threat: over-blocking — developer-written function listeners in `parts`
     * are legitimate (functions cannot come from JSON) and must keep firing,
     * and benign attributes must pass.
     *
     * Measure: without a `banProps` policy nothing `on*`-shaped is dropped;
     * functions and ordinary attributes flow through.
     */
    test('it should keep function listeners and benign attrs in `parts`', async () => {
      let fired = false

      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'text',
            label: 'Foo',
            parts: {
              input: {
                'data-marker': 'kept',
                onClick: () => {
                  fired = true
                },
              },
            } as any,
          },
        }),
      })

      await nextTick()

      const input = form.find('input')
      expect(input.attributes('data-marker')).toBe('kept')

      await input.trigger('click')
      expect(fired).toBe(true)
    })
  })

  describe('schema fallthrough attrs are filtered', () => {
    /**
     * Threat: undeclared schema keys become fallthrough attrs
     * (`v-bind="el.props"`) — so a bare `"onclick": "…"` key at the top of an
     * element's schema entry becomes a live handler without touching any
     * documented API.
     *
     * Measure: schema entry props are attr-sanitized before they reach the
     * component — with the documented `banProps: [/^on/i]` hardening in place,
     * the handler never lands.
     */
    test('it should not turn undeclared schema keys into live handlers', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const { form } = createForm(
        {
          schema: defineSchema({
            el: {
              type: 'button',
              text: 'Go',
              onclick: 'window.__schema3 = true',
            } as any,
          }),
        },
        { $security: { banProps: [/^on/i] } }
      )

      await nextTick()

      const button = form.find('button')
      expect(button.attributes('onclick')).toBeUndefined()
      expect(form.find('[onclick]').exists()).toBe(false)

      button.element.dispatchEvent(new Event('click'))
      expect((window as any).__schema3).toBeUndefined()

      warn.mockRestore()
    })
  })

  describe('grid cells', () => {
    /**
     * Threat: grid cell `attrs` bags — the same attribute-bag vector through
     * the grid schema.
     *
     * Measure: cell attrs pass through the same filter as `parts`, honoring the
     * configured `banProps` policy.
     */
    test('it should strip dangerous keys from grid cell attrs', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const { form } = createForm(
        {
          schema: defineSchema({
            g: {
              type: 'grid',
              cols: 1,
              grid: [
                [
                  {
                    content: 'cell',
                    attrs: {
                      onclick: 'window.__schema4 = true',
                      'data-kept': 'yes',
                    },
                  } as any,
                ],
              ],
            },
          }),
        },
        { $security: { banProps: [/^on/i] } }
      )

      await nextTick()

      expect(form.find('[data-kept="yes"]').exists()).toBe(true)
      expect(form.find('[onclick]').exists()).toBe(false)
      expect((window as any).__schema4).toBeUndefined()

      warn.mockRestore()
    })

    /**
     * Threat: HTML in grid string cells rendering without the grid area being
     * allowed.
     *
     * Measure: grid string cells render escaped by default; HTML requires
     * `allowHtml: ['grid']` and always passes through `sanitizeHtml` (here: the
     * explicit identity opt-out) — the new, deliberate capability.
     */
    test('it should render grid string cells escaped by default and as HTML when allowed', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const escaped = createForm(
        {
          schema: defineSchema({
            g: {
              type: 'grid',
              cols: 1,
              grid: [['<b>bold</b>']],
            },
          }),
        },
        { $security: { allowHtml: [] } }
      )

      await nextTick()

      expect(escaped.form.find('.vf-grid b').exists()).toBe(false)
      expect(escaped.form.text()).toContain('<b>bold</b>')

      const allowed = createForm(
        {
          schema: defineSchema({
            g: {
              type: 'grid',
              cols: 1,
              grid: [['<b class="cell-html">bold</b>']],
            },
          }),
        },
        {
          $security: { allowHtml: ['grid'], sanitizer: (html: string) => html },
        }
      )

      await nextTick()

      expect(allowed.form.find('.vf-grid b.cell-html').exists()).toBe(true)

      warn.mockRestore()
    })
  })

  describe('nested schema surfaces (list, grid, matrix)', () => {
    /**
     * Threat: a flat list's prototype is a schema entry spread verbatim onto
     * the item component (`v-bind`), so a string `onclick` in it would become a
     * live handler on every list item — the same fallthrough vector `useSchema`
     * closes for form-level entries.
     *
     * Measure: the flat prototype passes through the same attribute-bag filter
     * before the spread, honoring the configured `banProps` policy.
     */
    test('it should filter flat list prototypes like schema entries', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const { form } = createForm(
        {
          schema: defineSchema({
            items: {
              type: 'list',
              flat: true,
              default: ['x'],
              schema: {
                item: {
                  type: 'button',
                  text: 'Go',
                  onclick: 'window.__list1 = true',
                } as any,
              },
            },
          }),
        },
        { $security: { banProps: [/^on/i] } }
      )

      await nextTick()

      const button = form.find('button')
      expect(button.exists()).toBe(true)
      expect(button.attributes('onclick')).toBeUndefined()
      expect((window as any).__list1).toBeUndefined()

      warn.mockRestore()
    })

    /**
     * Threat: a flat list prototype naming an arbitrary registered component
     * via `component` — the same escalation the schema `component` gate closes
     * at the form level, previously ignored (and thus inconsistent) for list
     * prototypes.
     *
     * Measure: list prototypes resolve `component` exactly like `useSchema` —
     * only through `$security.allowComponents`, falling back to the
     * `Vf*`-from-`type` element otherwise.
     *
     * Verified red→green (positive path): before the resolution, a listed
     * `component` was silently ignored.
     */
    test('it should gate list prototype `component` strings like `useSchema`', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const denied = createForm(
        {
          schema: defineSchema({
            items: {
              type: 'list',
              flat: true,
              default: ['x'],
              schema: {
                item: { type: 'text', component: 'Leaked' } as any,
              },
            },
          }),
        },
        { $security: {} },
        withComponents
      )

      await nextTick()

      expect(denied.form.find('.leaked').exists()).toBe(false)
      expect(denied.form.find('input').exists()).toBe(true)

      const allowed = createForm(
        {
          schema: defineSchema({
            items: {
              type: 'list',
              flat: true,
              default: ['x'],
              schema: {
                item: { type: 'text', component: 'Leaked' } as any,
              },
            },
          }),
        },
        { $security: { allowComponents: ['Leaked'] } },
        withComponents
      )

      await nextTick()

      expect(allowed.form.find('.leaked').exists()).toBe(true)

      warn.mockRestore()
    })

    /**
     * Threat: grid element cells — `v-bind="cell.props"` spreads the cell's
     * schema object, the same fallthrough vector at the grid level.
     *
     * Measure: cell schemas pass through the attribute-bag filter when the cell
     * is resolved, honoring the configured `banProps` policy.
     */
    test('it should filter grid cell schemas like schema entries', async () => {
      const { form } = createForm(
        {
          schema: defineSchema({
            g: {
              type: 'grid',
              cols: 1,
              grid: [
                [
                  {
                    type: 'button',
                    text: 'Go',
                    onclick: 'window.__grid1 = true',
                  } as any,
                ],
              ],
            },
          }),
        },
        { $security: { banProps: [/^on/i] } }
      )

      await nextTick()

      const button = form.find('button')
      expect(button.exists()).toBe(true)
      expect(button.attributes('onclick')).toBeUndefined()
      expect((window as any).__grid1).toBeUndefined()
    })

    /**
     * Threat: matrix column schemas (`cols: [{ value, schema }]`) are spread
     * into the cell element's props — the same vector at the matrix level.
     *
     * Measure: column schemas pass through the attribute-bag filter before the
     * spread, honoring the configured `banProps` policy.
     */
    test('it should filter matrix column schemas like schema entries', async () => {
      const { form } = createForm(
        {
          schema: defineSchema({
            m: {
              type: 'matrix',
              cols: [
                {
                  value: 'a',
                  label: 'A',
                  schema: {
                    type: 'button',
                    text: 'Go',
                    onclick: 'window.__matrix1 = true',
                  },
                } as any,
              ],
              rows: [{ value: 'r1', label: 'Row 1' }],
            },
          }),
        },
        { $security: { banProps: [/^on/i] } }
      )

      await nextTick()

      const button = form.find('button')
      expect(button.exists()).toBe(true)
      expect(button.attributes('onclick')).toBeUndefined()
      expect((window as any).__matrix1).toBeUndefined()
    })
  })

  describe('grid cell and matrix column `component` strings', () => {
    /**
     * Threat: a grid cell schema naming an arbitrary registered component — the
     * same escalation the schema `component` gate closes at the form level,
     * previously ignored (and thus inconsistent) for grid cells.
     *
     * Measure: cell schemas resolve `component` exactly like `useSchema` — only
     * through `$security.allowComponents`, falling back to the
     * `Vf*`-from-`type` element otherwise.
     *
     * Verified red→green (positive path): before the resolution, a listed
     * `component` was silently ignored.
     */
    test('it should gate grid cell `component` strings like `useSchema`', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const denied = createForm(
        {
          schema: defineSchema({
            g: {
              type: 'grid',
              cols: 1,
              grid: [[{ type: 'text', component: 'Leaked' } as any]],
            },
          }),
        },
        { $security: {} },
        withComponents
      )

      await nextTick()

      expect(denied.form.find('.leaked').exists()).toBe(false)
      expect(denied.form.find('input').exists()).toBe(true)

      const allowed = createForm(
        {
          schema: defineSchema({
            g: {
              type: 'grid',
              cols: 1,
              grid: [[{ type: 'text', component: 'Leaked' } as any]],
            },
          }),
        },
        { $security: { allowComponents: ['Leaked'] } },
        withComponents
      )

      await nextTick()

      expect(allowed.form.find('.leaked').exists()).toBe(true)

      warn.mockRestore()
    })

    /**
     * Threat: the same vector through matrix column schemas (`cols: [{ value,
     * schema: { component } }]`).
     *
     * Measure: column schemas resolve `component` through the same gate,
     * falling back to the type-derived element.
     *
     * Verified red→green (positive path): before the resolution, a listed
     * `component` was silently ignored.
     */
    test('it should gate matrix column `component` strings like `useSchema`', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const denied = createForm(
        {
          schema: defineSchema({
            m: {
              type: 'matrix',
              cols: [
                {
                  value: 'a',
                  label: 'A',
                  schema: { type: 'text', component: 'Leaked' },
                } as any,
              ],
              rows: [{ value: 'r1', label: 'Row 1' }],
            },
          }),
        },
        { $security: {} },
        withComponents
      )

      await nextTick()

      expect(denied.form.find('.leaked').exists()).toBe(false)
      expect(denied.form.find('input').exists()).toBe(true)

      const allowed = createForm(
        {
          schema: defineSchema({
            m: {
              type: 'matrix',
              cols: [
                {
                  value: 'a',
                  label: 'A',
                  schema: { type: 'text', component: 'Leaked' },
                } as any,
              ],
              rows: [{ value: 'r1', label: 'Row 1' }],
            },
          }),
        },
        { $security: { allowComponents: ['Leaked'] } },
        withComponents
      )

      await nextTick()

      expect(allowed.form.find('.leaked').exists()).toBe(true)

      warn.mockRestore()
    })
  })

  describe('`banProps` as a schema channel kill-switch', () => {
    /**
     * Threat: a hardened app that wants no schema-driven presentation at all —
     * filters are denylists an auditor has to trust, while a disabled channel
     * has nothing to bypass.
     *
     * Measure: schema entries pass the same prop filter as every bag, so
     * listing a channel name (`parts`, `slots`) removes the entire channel from
     * schemas.
     *
     * Verified red→green: covered by the `banProps` enforcement red-run — the
     * same mechanism, applied at the schema-entry surface.
     */
    test('it should strip banned channels from schema entries', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const { form } = createForm(
        {
          schema: defineSchema({
            el: {
              type: 'text',
              label: 'Foo',
              parts: { input: { 'data-probe': 'x' } },
              slots: { label: 'Custom label' },
            } as any,
          }),
        },
        { $security: { banProps: ['parts', 'slots'] } }
      )

      await nextTick()

      expect(form.find('input').attributes('data-probe')).toBeUndefined()
      expect(form.find('.vf-label-group').text()).not.toContain('Custom label')

      warn.mockRestore()
    })

    /**
     * Threat: over-blocking — the kill-switch must be scoped to schemas. Props
     * written in the developer's own templates never pass through schema
     * resolution, so the same `banProps` config must leave them untouched, or
     * hardened apps would lose core template API.
     *
     * Measure: SFC-passed `parts` keep working under the exact config that
     * strips them from schemas.
     */
    test('it should leave template-passed props untouched', async () => {
      const App = defineComponent({
        template: `<VfForm><VfText name="el" label="Foo" :parts="{ input: { 'data-probe': 'x' } }" /></VfForm>`,
      })

      const app = mountApp(App, {}, {
        $security: { banProps: ['parts', 'slots'] },
      } as any)

      await nextTick()

      expect(app.find('input').attributes('data-probe')).toBe('x')
    })
  })

  describe('without the security module', () => {
    /**
     * Threat: none — this documents the module boundary. Attribute filtering
     * (the built-in denylist and `banProps` alike) is the security module's
     * feature: a modular setup that omits the module gets its attribute bags
     * exactly as written, and a configured-but-unenforced `banProps` warns
     * once, like the ciphers and `allowOrigins`.
     */
    test('it should leave attribute bags unfiltered and warn about banProps', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const { form } = createForm(
        {
          schema: defineSchema({
            el: {
              type: 'button',
              text: 'Go',
              parts: { button: { style: 'color: blue' } } as any,
            },
          }),
        },
        {
          modules: modulesWithoutSecurity,
          $security: { banProps: ['style'] },
        }
      )

      await nextTick()

      expect(form.find('button').attributes('style')).toContain('color: blue')
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining(
          '`$security` options are configured but the `security` module is not registered'
        )
      )

      warn.mockRestore()
    })
  })
})
