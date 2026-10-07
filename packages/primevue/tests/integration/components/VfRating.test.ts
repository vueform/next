import { defineSchema } from '@vueform/primevue'
import { nextTick } from 'vue'

import { createForm } from '../../helpers'

// =============================================================================
// Basic rendering
// =============================================================================
describe('Basic rendering', () => {
  test('renders PrimeVue Rating component', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'rating' },
      }),
    })

    expect(form.findComponent({ name: 'Rating' }).exists()).toBe(true)
  })
})

// =============================================================================
// Model binding
// =============================================================================
describe('Model binding', () => {
  test('has null default value', () => {
    const { el } = createForm({
      schema: defineSchema({
        el: { type: 'rating' },
      }),
    })

    expect(el.value).toBeNull()
  })

  test('renders with default value', () => {
    const { el } = createForm({
      schema: defineSchema({
        el: { type: 'rating', defaultValue: 3 },
      }),
    })

    expect(el.value).toBe(3)
  })

  test('updates value on model-value update', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'rating' },
      }),
    })

    const rating = form.findComponent({ name: 'Rating' })
    rating.vm.$emit('update:modelValue', 4)
    await nextTick()

    expect(el.value).toBe(4)
  })
})

// =============================================================================
// Props
// =============================================================================
describe('Props', () => {
  test('passes stars prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'rating', stars: 10 },
      }),
    })

    const rating = form.findComponent({ name: 'Rating' })
    expect(rating.props('stars')).toBe(10)
  })

  test('passes disabled prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'rating', disabled: true },
      }),
    })

    const rating = form.findComponent({ name: 'Rating' })
    expect(rating.props('disabled')).toBe(true)
  })

  test('passes readonly prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'rating', readonly: true },
      }),
    })

    const rating = form.findComponent({ name: 'Rating' })
    expect(rating.props('readonly')).toBe(true)
  })
})
