import { defineSchema } from '@vueform/primevue'
import { nextTick } from 'vue'
import { createForm } from '../../helpers'

// =============================================================================
// Basic rendering
// =============================================================================
describe('Basic rendering', () => {
  test('renders PrimeVue ToggleButton component', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'toggle-button' },
      }),
    })

    expect(form.findComponent({ name: 'ToggleButton' }).exists()).toBe(true)
  })
})

// =============================================================================
// Model binding
// =============================================================================
describe('Model binding', () => {
  test('renders with default value', () => {
    const { el } = createForm({
      schema: defineSchema({
        el: { type: 'toggle-button', defaultValue: true },
      }),
    })

    expect(el.value).toBe(true)
  })

  test('updates value on model-value update', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'toggle-button' },
      }),
    })

    const btn = form.findComponent({ name: 'ToggleButton' })
    btn.vm.$emit('update:modelValue', true)
    await nextTick()

    expect(el.value).toBe(true)
  })
})

// =============================================================================
// Props
// =============================================================================
describe('Props', () => {
  test('passes disabled prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'toggle-button', disabled: true },
      }),
    })

    const btn = form.findComponent({ name: 'ToggleButton' })
    expect(btn.props('disabled')).toBe(true)
  })

  test('passes onLabel and offLabel', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'toggle-button', onLabel: 'On', offLabel: 'Off' },
      }),
    })

    const btn = form.findComponent({ name: 'ToggleButton' })
    expect(btn.props('onLabel')).toBe('On')
    expect(btn.props('offLabel')).toBe('Off')
  })

  test('passes fluid prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'toggle-button', fluid: true },
      }),
    })

    const btn = form.findComponent({ name: 'ToggleButton' })
    expect(btn.props('fluid')).toBe(true)
  })
})
