import { defineSchema } from '@vueform/primevue'
import { nextTick } from 'vue'
import { createForm } from '../../helpers'

// =============================================================================
// Basic rendering
// =============================================================================
describe('Basic rendering', () => {
  test('renders PrimeVue Password component', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'password' },
      }),
    })

    expect(form.findComponent({ name: 'Password' }).exists()).toBe(true)
  })

  test('renders with placeholder', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'password', placeholder: 'Enter password' },
      }),
    })

    const input = form.find('input')
    expect(input.attributes('placeholder')).toBe('Enter password')
  })

  test('renders with fluid prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'password' },
      }),
    })

    const password = form.findComponent({ name: 'Password' })
    expect(password.props('fluid')).toBe(true)
  })
})

// =============================================================================
// Model binding
// =============================================================================
describe('Model binding', () => {
  test('has null default value', () => {
    const { el } = createForm({
      schema: defineSchema({
        el: { type: 'password' },
      }),
    })

    expect(el.value).toBeNull()
  })

  test('renders with default value', () => {
    const { el } = createForm({
      schema: defineSchema({
        el: { type: 'password', defaultValue: 'secret123' },
      }),
    })

    expect(el.value).toBe('secret123')
  })

  test('updates value on input event', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'password' },
      }),
    })

    const input = form.find('input')
    await input.setValue('new-password')
    await nextTick()

    expect(el.value).toBe('new-password')
  })
})

// =============================================================================
// Props
// =============================================================================
describe('Props', () => {
  test('passes disabled prop to Password', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'password', disabled: true },
      }),
    })

    const password = form.findComponent({ name: 'Password' })
    expect(password.props('disabled')).toBe(true)
  })

  test('passes toggleMask prop to Password', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'password', toggleMask: true },
      }),
    })

    const password = form.findComponent({ name: 'Password' })
    expect(password.props('toggleMask')).toBe(true)
  })

  test('passes feedback prop to Password', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'password', feedback: false },
      }),
    })

    const password = form.findComponent({ name: 'Password' })
    expect(password.props('feedback')).toBe(false)
  })
})
