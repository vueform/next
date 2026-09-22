import { defineSchema } from '@vueform/primevue'
import { nextTick } from 'vue'
import { createForm } from '../../helpers'

// =============================================================================
// Basic rendering
// =============================================================================
describe('Basic rendering', () => {
  test('renders PrimeVue Slider component', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'slider' },
      }),
    })

    expect(form.findComponent({ name: 'Slider' }).exists()).toBe(true)
  })
})

// =============================================================================
// Model binding
// =============================================================================
describe('Model binding', () => {
  test('has null default value', () => {
    const { el } = createForm({
      schema: defineSchema({
        el: { type: 'slider' },
      }),
    })

    expect(el.value).toBeNull()
  })

  test('renders with default value', () => {
    const { el } = createForm({
      schema: defineSchema({
        el: { type: 'slider', defaultValue: 50 },
      }),
    })

    expect(el.value).toBe(50)
  })

  test('updates value on model-value update', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'slider' },
      }),
    })

    const slider = form.findComponent({ name: 'Slider' })
    slider.vm.$emit('update:modelValue', 75)
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
        el: { type: 'slider', min: 10 },
      }),
    })

    const slider = form.findComponent({ name: 'Slider' })
    expect(slider.props('min')).toBe(10)
  })

  test('passes max prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'slider', max: 200 },
      }),
    })

    const slider = form.findComponent({ name: 'Slider' })
    expect(slider.props('max')).toBe(200)
  })

  test('passes step prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'slider', step: 5 },
      }),
    })

    const slider = form.findComponent({ name: 'Slider' })
    expect(slider.props('step')).toBe(5)
  })

  test('passes range prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'slider', range: true },
      }),
    })

    const slider = form.findComponent({ name: 'Slider' })
    expect(slider.props('range')).toBe(true)
  })

  test('passes orientation prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'slider', orientation: 'vertical' },
      }),
    })

    const slider = form.findComponent({ name: 'Slider' })
    expect(slider.props('orientation')).toBe('vertical')
  })

  test('passes disabled prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'slider', disabled: true },
      }),
    })

    const slider = form.findComponent({ name: 'Slider' })
    expect(slider.props('disabled')).toBe(true)
  })

  test('passes invalid state', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'slider', rules: 'required' },
      }),
    })

    const slider = form.findComponent({ name: 'Slider' })
    expect(slider.props('invalid')).toBe(false)
  })
})
