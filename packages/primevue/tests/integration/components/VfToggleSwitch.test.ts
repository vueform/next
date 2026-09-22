import { defineSchema } from '@vueform/primevue'
import { nextTick } from 'vue'
import { createForm } from '../../helpers'

// =============================================================================
// Basic rendering
// =============================================================================
describe('Basic rendering', () => {
  test('renders PrimeVue ToggleSwitch component', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'toggle-switch' },
      }),
    })

    expect(form.findComponent({ name: 'ToggleSwitch' }).exists()).toBe(true)
  })
})

// =============================================================================
// Model binding
// =============================================================================
describe('Model binding', () => {
  test('has default value matching falseValue', () => {
    const { el } = createForm({
      schema: defineSchema({
        el: { type: 'toggle-switch' },
      }),
    })

    expect(el.value).toBe(false)
  })

  test('renders with default value', () => {
    const { el } = createForm({
      schema: defineSchema({
        el: { type: 'toggle-switch', defaultValue: true },
      }),
    })

    expect(el.value).toBe(true)
  })

  test('updates value on model-value update', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'toggle-switch' },
      }),
    })

    const toggle = form.findComponent({ name: 'ToggleSwitch' })
    toggle.vm.$emit('update:modelValue', true)
    await nextTick()

    expect(el.value).toBe(true)
  })

  test('supports custom trueValue and falseValue', () => {
    const { el } = createForm({
      schema: defineSchema({
        el: {
          type: 'toggle-switch',
          trueValue: 'yes',
          falseValue: 'no',
          defaultValue: 'yes',
        },
      }),
    })

    expect(el.value).toBe('yes')
  })
})

// =============================================================================
// Props
// =============================================================================
describe('Props', () => {
  test('passes disabled prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'toggle-switch', disabled: true },
      }),
    })

    const toggle = form.findComponent({ name: 'ToggleSwitch' })
    expect(toggle.props('disabled')).toBe(true)
  })

  test('passes readonly prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'toggle-switch', readonly: true },
      }),
    })

    const toggle = form.findComponent({ name: 'ToggleSwitch' })
    expect(toggle.props('readonly')).toBe(true)
  })
})
