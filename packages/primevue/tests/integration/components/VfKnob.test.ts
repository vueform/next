import { defineSchema } from '@vueform/primevue'
import { nextTick } from 'vue'
import { createForm } from '../../helpers'

// =============================================================================
// Basic rendering
// =============================================================================
describe('Basic rendering', () => {
  test('renders PrimeVue Knob component', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'knob' },
      }),
    })

    expect(form.findComponent({ name: 'Knob' }).exists()).toBe(true)
  })
})

// =============================================================================
// Model binding
// =============================================================================
describe('Model binding', () => {
  test('has null default value', () => {
    const { el } = createForm({
      schema: defineSchema({
        el: { type: 'knob' },
      }),
    })

    expect(el.value).toBeNull()
  })

  test('renders with default value', () => {
    const { el } = createForm({
      schema: defineSchema({
        el: { type: 'knob', defaultValue: 50 },
      }),
    })

    expect(el.value).toBe(50)
  })

  test('updates value on model-value update', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'knob' },
      }),
    })

    const knob = form.findComponent({ name: 'Knob' })
    knob.vm.$emit('update:modelValue', 75)
    await nextTick()

    expect(el.value).toBe(75)
  })
})

// =============================================================================
// Props
// =============================================================================
describe('Props', () => {
  test('passes min prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'knob', min: 10 },
      }),
    })

    const knob = form.findComponent({ name: 'Knob' })
    expect(knob.props('min')).toBe(10)
  })

  test('passes max prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'knob', max: 200 },
      }),
    })

    const knob = form.findComponent({ name: 'Knob' })
    expect(knob.props('max')).toBe(200)
  })

  test('passes step prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'knob', step: 5 },
      }),
    })

    const knob = form.findComponent({ name: 'Knob' })
    expect(knob.props('step')).toBe(5)
  })

  test('passes disabled prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'knob', disabled: true },
      }),
    })

    const knob = form.findComponent({ name: 'Knob' })
    expect(knob.props('disabled')).toBe(true)
  })

  test('passes readonly prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'knob', readonly: true },
      }),
    })

    const knob = form.findComponent({ name: 'Knob' })
    expect(knob.props('readonly')).toBe(true)
  })
})
