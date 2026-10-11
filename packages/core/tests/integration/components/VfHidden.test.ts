import { defineSchema } from '@vueform/core'
import { nextTick } from 'vue'

import { createForm, makeApp, mountApp, vModelAndChange } from '../../helpers'

// =============================================================================
// PROPS
// =============================================================================
describe('VfHidden props', () => {
  describe('modelValue / default', () => {
    it('should render a hidden input with null value by default', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'hidden' },
        }),
      })

      const comp = form.findComponent({ name: 'VfHidden' })
      const input = comp.find('input[type="hidden"]')
      expect(input.exists()).toBe(true)
      expect(input.attributes('value')).toBeUndefined()
    })

    it('should render a string default as the input value', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'hidden', default: 'secret' },
        }),
      })

      const comp = form.findComponent({ name: 'VfHidden' })
      const input = comp.find('input[type="hidden"]')
      expect(input.attributes('value')).toBe('secret')
    })

    it('should render a number default as the input value', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'hidden', default: 42 },
        }),
      })

      const comp = form.findComponent({ name: 'VfHidden' })
      const input = comp.find('input[type="hidden"]')
      expect(input.attributes('value')).toBe('42')
    })

    it('should not bind a non-string/number value to the input', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'hidden', default: { foo: 'bar' } },
        }),
      })

      const comp = form.findComponent({ name: 'VfHidden' })
      const input = comp.find('input[type="hidden"]')
      expect(input.attributes('value')).toBeUndefined()
    })

    it('should not bind an array value to the input', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'hidden', default: [1, 2, 3] },
        }),
      })

      const comp = form.findComponent({ name: 'VfHidden' })
      const input = comp.find('input[type="hidden"]')
      expect(input.attributes('value')).toBeUndefined()
    })

    it('should still store non-string/number values in the data model', () => {
      const obj = { foo: 'bar' }

      const { el } = createForm({
        schema: defineSchema({
          el: { type: 'hidden', default: obj },
        }),
      })

      expect(el.value).toEqual(obj)
    })
  })

  describe('meta', () => {
    it('should render a hidden input when meta is false (default)', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'hidden', default: 'value' },
        }),
      })

      const comp = form.findComponent({ name: 'VfHidden' })
      expect(comp.find('input[type="hidden"]').exists()).toBe(true)
    })

    it('should not render a hidden input when meta is true', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'hidden', meta: true, default: 'value' },
        }),
      })

      const comp = form.findComponent({ name: 'VfHidden' })
      expect(comp.find('input[type="hidden"]').exists()).toBe(false)
    })

    it('should still store the value in the data model when meta is true', () => {
      const { el } = createForm({
        schema: defineSchema({
          el: { type: 'hidden', meta: true, default: 'secret' },
        }),
      })

      expect(el.value).toBe('secret')
    })

    it('should still be included in form data when meta is true', () => {
      const { form$ } = createForm({
        schema: defineSchema({
          el: { type: 'hidden', meta: true, default: 'secret' },
        }),
      })

      expect(form$.payload).toEqual({ el: 'secret' })
    })
  })

  describe('submit', () => {
    it('should include value in form data when submit is true (default)', () => {
      const { form$ } = createForm({
        schema: defineSchema({
          el: { type: 'hidden', default: 'included' },
        }),
      })

      expect(form$.payload).toEqual({ el: 'included' })
    })

    it('should exclude value from form data when submit is false', () => {
      const { form$ } = createForm({
        schema: defineSchema({
          el: { type: 'hidden', default: 'excluded', submit: false },
        }),
      })

      expect(form$.payload).toEqual({})
    })
  })

  describe('layout', () => {
    it('should not render a VfLayout wrapper', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'hidden', default: 'value' },
        }),
      })

      const comp = form.findComponent({ name: 'VfHidden' })
      expect(comp.findComponent({ name: 'VfLayout' }).exists()).toBe(false)
    })

    it('should not render label, help, or description elements', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'hidden',
            default: 'value',
            label: 'Label',
            help: 'Help',
            description: 'Description',
          },
        }),
      })

      const comp = form.findComponent({ name: 'VfHidden' })
      expect(comp.find('.vf-label').exists()).toBe(false)
      expect(comp.find('.vf-help').exists()).toBe(false)
      expect(comp.find('.vf-description').exists()).toBe(false)
    })
  })
})

// =============================================================================
// EVENTS
// =============================================================================
describe('VfHidden events', () => {
  describe('change', () => {
    it('should emit change event when value is updated programmatically', async () => {
      const onChange = vi.fn()

      const { el } = createForm({
        schema: defineSchema({
          el: { type: 'hidden', default: 'old', onChange },
        }),
      })

      el.update('new')
      await nextTick()

      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange.mock.calls[0][0]).toBe('new')
      expect(onChange.mock.calls[0][1]).toBe('old')
    })

    it('should not emit change when the value does not change', async () => {
      const onChange = vi.fn()

      const { el } = createForm({
        schema: defineSchema({
          el: { type: 'hidden', default: 'same', onChange },
        }),
      })

      el.update('same')
      await nextTick()

      expect(onChange).not.toHaveBeenCalled()
    })

    it('should emit change with object values', async () => {
      const onChange = vi.fn()
      const oldVal = { a: 1 }
      const newVal = { b: 2 }

      const { el } = createForm({
        schema: defineSchema({
          el: { type: 'hidden', default: oldVal, onChange },
        }),
      })

      el.update(newVal)
      await nextTick()

      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange.mock.calls[0][0]).toEqual(newVal)
      expect(onChange.mock.calls[0][1]).toEqual(oldVal)
    })
  })

  describe('update:modelValue', () => {
    it('should sync v-model when value changes programmatically', async () => {
      const App = makeApp(
        `<VfForm ref="form$">
          <VfHidden name="el" :default="'initial'" ${vModelAndChange('form')} />
        </VfForm>`
      )

      const app = mountApp(App, {
        props: {
          form: 'initial',
          'onUpdate:form': (v: any) => app.setProps({ form: v }),
        },
      })

      const comp = app.findComponent({ name: 'VfHidden' })
      comp.vm.update('updated')
      await nextTick()

      expect(app.props('form')).toBe('updated')
    })

    it('should accept external v-model updates', async () => {
      const App = makeApp(
        `<VfForm ref="form$">
          <VfHidden name="el" ${vModelAndChange('form')} />
        </VfForm>`
      )

      const app = mountApp(App, {
        props: {
          form: 'initial',
          'onUpdate:form': (v: any) => app.setProps({ form: v }),
        },
      })

      await app.setProps({ form: 'external' })
      await nextTick()

      const comp = app.findComponent({ name: 'VfHidden' })
      expect(comp.vm.value).toBe('external')
    })

    it('should sync v-model with object values', async () => {
      const App = makeApp(
        `<VfForm ref="form$">
          <VfHidden name="el" ${vModelAndChange('form')} />
        </VfForm>`
      )

      const app = mountApp(App, {
        props: {
          form: null,
          'onUpdate:form': (v: any) => app.setProps({ form: v }),
        },
      })

      const obj = { key: 'value' }
      const comp = app.findComponent({ name: 'VfHidden' })
      comp.vm.update(obj)
      await nextTick()

      expect(app.props('form')).toEqual(obj)
    })
  })
})
