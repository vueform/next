import { defineSchema } from '@vueform/primevue'
import { nextTick } from 'vue'
import { createForm } from '../helpers'

// =============================================================================
// Basic rendering
// =============================================================================
describe('Basic rendering', () => {
  test('renders PrimeVue Editor component', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'editor' },
      }),
    })

    expect(form.findComponent({ name: 'Editor' }).exists()).toBe(true)
  })
})

// =============================================================================
// Model binding
// =============================================================================
describe('Model binding', () => {
  test('has null default value', () => {
    const { el } = createForm({
      schema: defineSchema({
        el: { type: 'editor' },
      }),
    })

    expect(el.value).toBeNull()
  })

  test('renders with custom default value', () => {
    const { el } = createForm({
      schema: defineSchema({
        el: { type: 'editor', defaultValue: '<p>Hello</p>' },
      }),
    })

    expect(el.value).toBe('<p>Hello</p>')
  })

  test('updates value on model-value update', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'editor' },
      }),
    })

    const editor = form.findComponent({ name: 'Editor' })
    editor.vm.$emit('update:modelValue', '<p>Updated</p>')
    await nextTick()

    expect(el.value).toBe('<p>Updated</p>')
  })
})

// =============================================================================
// Props
// =============================================================================
describe('Props', () => {
  test('passes placeholder prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'editor', placeholder: 'Enter content...' },
      }),
    })

    const editor = form.findComponent({ name: 'Editor' })
    expect(editor.props('placeholder')).toBe('Enter content...')
  })

  test('passes readonly prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'editor', readonly: true },
      }),
    })

    const editor = form.findComponent({ name: 'Editor' })
    expect(editor.props('readonly')).toBe(true)
  })
})
