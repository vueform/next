import { defineSchema } from '@vueform/core'

import { createForm, makeApp, mountApp } from '../../helpers'

// =============================================================================
// MODIFIERS (STATE / VARIANT DATA ATTRIBUTES)
// =============================================================================
// States and variants are expressed as part-keyed `data-*` modifier bags
// (enums as values, booleans as presence). ARIA is a separate aspect: when a
// state matters to both worlds, both attributes are emitted from the same
// source (aria-invalid ∥ data-invalid, aria-busy ∥ data-loading); CSS keys on
// the data-* side. Classes carry part names only.
describe('Modifiers', () => {
  describe('VfButton', () => {
    it('should expose variant, severity and size as enum data attributes', () => {
      const { form } = createForm({
        schema: defineSchema({
          btn: { type: 'button', text: 'Go' },
        }),
      })

      const btn = form.find('.vf-btn')
      expect(btn.attributes('data-variant')).toBe('filled')
      expect(btn.attributes('data-severity')).toBe('secondary')
      expect(btn.attributes('data-size')).toBe('medium')
      expect(btn.attributes('data-align')).toBeUndefined()
      expect(btn.attributes('data-fluid')).toBeUndefined()
      expect(btn.attributes('data-icon-only')).toBeUndefined()
    })

    it('should expose boolean states as presence attributes, never "false"', () => {
      const { form } = createForm({
        schema: defineSchema({
          btn: {
            type: 'button',
            text: 'Go',
            fluid: true,
            align: 'right',
            variant: 'outlined',
            severity: 'danger',
          },
        }),
      })

      const btn = form.find('.vf-btn')
      expect(btn.attributes('data-fluid')).toBe('')
      expect(btn.attributes('data-align')).toBe('right')
      expect(btn.attributes('data-variant')).toBe('outlined')
      expect(btn.attributes('data-severity')).toBe('danger')
    })

    it('should emit aria-busy and data-loading together while loading', () => {
      const { form } = createForm({
        schema: defineSchema({
          btn: { type: 'button', text: 'Go', loading: true },
          plain: { type: 'button', text: 'Plain' },
        }),
      })

      const buttons = form.findAll('.vf-btn')
      expect(buttons[0].attributes('aria-busy')).toBe('true')
      expect(buttons[0].attributes('data-loading')).toBe('')
      expect(buttons[1].attributes('aria-busy')).toBeUndefined()
      expect(buttons[1].attributes('data-loading')).toBeUndefined()
    })

    it('should rely on native disabled alone on <button>, splitting only in anchor mode', () => {
      const { form } = createForm({
        schema: defineSchema({
          native: { type: 'button', text: 'Go', disabled: true },
          link: {
            type: 'button',
            text: 'Go',
            href: 'https://example.com',
            disabled: true,
          },
        }),
      })

      const native = form.find('button.vf-btn')
      expect(native.attributes('disabled')).toBeDefined()
      expect(native.attributes('data-disabled')).toBeUndefined()
      expect(native.attributes('aria-disabled')).toBeUndefined()

      // Anchors have no native disabled attribute, so both aspects need
      // their own marker there.
      const anchor = form.find('a.vf-btn')
      expect(anchor.attributes('disabled')).toBeUndefined()
      expect(anchor.attributes('aria-disabled')).toBe('true')
      expect(anchor.attributes('data-disabled')).toBe('')
    })

    it('should never render a data attribute with the literal value "false"', () => {
      const { form } = createForm({
        schema: defineSchema({
          btn: { type: 'button', text: 'Go' },
          name: { type: 'text', label: 'Name' },
          choices: {
            type: 'radios',
            label: 'Choices',
            items: { a: 'A', b: 'B' },
          },
        }),
      })

      const elements: Element[] = Array.from(form.element.querySelectorAll('*'))
      const offenders = elements.flatMap((el) =>
        Array.from(el.attributes)
          .filter(
            (attr) => attr.name.startsWith('data-') && attr.value === 'false'
          )
          .map((attr) => `${el.tagName}[${attr.name}]`)
      )
      expect(offenders).toEqual([])
    })
  })

  describe('aspect-split pairs', () => {
    it('should emit aria-invalid and data-invalid together after validation', async () => {
      const { form, form$ } = createForm({
        schema: defineSchema({
          name: { type: 'text', label: 'Name', rules: 'required' },
        }),
      })

      const input = form.find('.vf-input')
      expect(input.attributes('aria-invalid')).toBeUndefined()
      expect(input.attributes('data-invalid')).toBeUndefined()

      await form$.validate()
      expect(input.attributes('aria-invalid')).toBe('true')
      expect(input.attributes('data-invalid')).toBe('')
      expect(input.classes()).not.toContain('vf-danger')
    })
  })

  describe('state classes removed', () => {
    it('should keep only part-name classes on stateful parts', async () => {
      const { form, form$ } = createForm({
        schema: defineSchema({
          name: { type: 'text', label: 'Name', rules: 'required' },
        }),
      })

      const input = form.find('.vf-input')
      expect(input.classes()).not.toContain('vf-danger')

      await form$.validate()
      expect(input.classes()).not.toContain('vf-danger')
    })

    it('should expose group layout state as data attributes', () => {
      const { form } = createForm({
        schema: defineSchema({
          choices: {
            type: 'radios',
            label: 'Choices',
            items: { a: 'A' },
            stacked: true,
          },
          plain: {
            type: 'radios',
            label: 'Plain',
            items: { a: 'A' },
          },
        }),
      })

      const groups = form.findAll('.vf-choices-group')
      expect(groups[0].attributes('data-stacked')).toBe('')
      expect(groups[1].attributes('data-stacked')).toBeUndefined()
    })
  })

  describe('tablist wrappers', () => {
    it('should mark the selected tab wrapper with data-selected only', () => {
      const { form } = createForm({
        tabbed: true,
        schema: defineSchema({
          tab1: {
            type: 'group',
            page: 'Tab 1',
            schema: { a: { type: 'text', label: 'A' } },
          },
          tab2: {
            type: 'group',
            page: 'Tab 2',
            schema: { b: { type: 'text', label: 'B' } },
          },
        }),
      })

      const wrappers = form.findAll('.vf-tab-wrapper')
      expect(wrappers[0].attributes('data-selected')).toBe('')
      expect(wrappers[1].attributes('data-selected')).toBeUndefined()
      expect(wrappers[0].attributes('data-invalid')).toBeUndefined()
    })
  })

  describe('slot propagation', () => {
    it('should hand slots the modifier bags so replaced parts keep their state attrs', () => {
      const App = makeApp(
        `<VfForm ref="form$">
          <VfList
            name="list"
            flat
            wrap
            :model-value="['foo', 'bar']"
            :schema="{ text: { type: 'text' } }"
          >
            <template #item="{ modifiers, index }">
              <div class="custom-item" v-bind="modifiers.item(false, false)">
                item {{ index }}
              </div>
            </template>
          </VfList>
        </VfForm>`
      )

      const app = mountApp(App)
      const items = app.findAll('.custom-item')
      expect(items.length).toBeGreaterThan(0)
      for (const item of items) {
        expect(item.attributes('data-wrapped')).toBe('')
        expect(item.attributes('data-dragging')).toBeUndefined()
        expect(item.attributes('data-drop-target')).toBeUndefined()
      }
    })
  })
})
