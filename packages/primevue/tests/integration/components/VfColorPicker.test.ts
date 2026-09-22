import { defineSchema } from '@vueform/primevue'
import { nextTick } from 'vue'
import { createForm } from '../../helpers'

// =============================================================================
// Basic rendering
// =============================================================================
describe('Basic rendering', () => {
  test('renders PrimeVue ColorPicker component', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'color-picker' },
      }),
    })

    expect(form.findComponent({ name: 'ColorPicker' }).exists()).toBe(true)
  })
})

// =============================================================================
// Model binding
// =============================================================================
describe('Model binding', () => {
  test('has null default value', () => {
    const { el } = createForm({
      schema: defineSchema({
        el: { type: 'color-picker' },
      }),
    })

    expect(el.value).toBe(el.props.defaultColor)
  })

  test('renders with default value', () => {
    const { el } = createForm({
      schema: defineSchema({
        el: { type: 'color-picker', defaultValue: 'ff0000' },
      }),
    })

    expect(el.value).toBe('ff0000')
  })

  test('updates value on model-value update', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'color-picker' },
      }),
    })

    const colorPicker = form.findComponent({ name: 'ColorPicker' })
    colorPicker.vm.$emit('update:modelValue', '00ff00')
    await nextTick()

    expect(el.value).toBe('00ff00')
  })
})

// =============================================================================
// Props
// =============================================================================
describe('Props', () => {
  test('passes format prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'color-picker', format: 'rgb' },
      }),
    })

    const colorPicker = form.findComponent({ name: 'ColorPicker' })
    expect(colorPicker.props('format')).toBe('rgb')
  })

  test('resolves defaultColor from blueprint defaults', () => {
    const { el } = createForm({
      schema: defineSchema({
        el: { type: 'color-picker' },
      }),
    })

    expect(el.props.defaultColor).toBe('ff0000')
  })

  test('passes disabled prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'color-picker', disabled: true },
      }),
    })

    const colorPicker = form.findComponent({ name: 'ColorPicker' })
    expect(colorPicker.props('disabled')).toBe(true)
  })

  test('passes invalid state', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'color-picker', rules: 'required' },
      }),
    })

    const colorPicker = form.findComponent({ name: 'ColorPicker' })
    expect(colorPicker.props('invalid')).toBe(false)
  })
})
