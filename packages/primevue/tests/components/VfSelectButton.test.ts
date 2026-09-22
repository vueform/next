import { defineSchema, defineSlot } from '@vueform/primevue'
import { defineComponent, h, nextTick, resolveComponent } from 'vue'
import { createForm, mountApp } from '../helpers'

// =============================================================================
// Basic rendering
// =============================================================================
describe('Basic rendering', () => {
  test('renders PrimeVue SelectButton component', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'select-button' },
      }),
    })

    expect(form.findComponent({ name: 'SelectButton' }).exists()).toBe(true)
  })

  test('renders with fluid prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'select-button' },
      }),
    })

    const sb = form.findComponent({ name: 'SelectButton' })
    expect(sb.props('fluid')).toBe(true)
  })
})

// =============================================================================
// Model binding
// =============================================================================
describe('Model binding', () => {
  test('has null default value', () => {
    const { el } = createForm({
      schema: defineSchema({
        el: { type: 'select-button' },
      }),
    })

    expect(el.value).toBeNull()
  })

  test('renders with custom default value', () => {
    const { el } = createForm({
      schema: defineSchema({
        el: {
          type: 'select-button',
          options: [
            { value: 'a', label: 'A' },
            { value: 'b', label: 'B' },
          ],
          defaultValue: 'a',
        },
      }),
    })

    expect(el.value).toBe('a')
  })

  test('updates value on model-value update', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: {
          type: 'select-button',
          options: [
            { value: 'a', label: 'A' },
            { value: 'b', label: 'B' },
          ],
        },
      }),
    })

    const sb = form.findComponent({ name: 'SelectButton' })
    sb.vm.$emit('update:modelValue', 'b')
    await nextTick()

    expect(el.value).toBe('b')
  })
})

// =============================================================================
// Options
// =============================================================================
describe('Options', () => {
  test('passes options to SelectButton', () => {
    const opts = [
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B' },
    ]

    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'select-button', options: opts },
      }),
    })

    const sb = form.findComponent({ name: 'SelectButton' })
    expect(sb.props('options')).toHaveLength(2)
  })

  test('passes optionLabel and optionValue', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: {
          type: 'select-button',
          options: [{ code: 'us', name: 'US' }],
          optionValue: 'code',
          optionLabel: 'name',
        },
      }),
    })

    const sb = form.findComponent({ name: 'SelectButton' })
    expect(sb.props('optionLabel')).toBe('name')
    expect(sb.props('optionValue')).toBe('code')
  })
})

// =============================================================================
// Multiple mode
// =============================================================================
describe('Multiple mode', () => {
  test('defaults to single selection (multiple=false)', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'select-button' },
      }),
    })

    const sb = form.findComponent({ name: 'SelectButton' })
    expect(sb.props('multiple')).toBe(false)
  })

  test('supports multiple selection', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: {
          type: 'select-button',
          options: [
            { value: 'a', label: 'A' },
            { value: 'b', label: 'B' },
          ],
          multiple: true,
        },
      }),
    })

    const sb = form.findComponent({ name: 'SelectButton' })
    expect(sb.props('multiple')).toBe(true)

    sb.vm.$emit('update:modelValue', ['a', 'b'])
    await nextTick()

    expect(el.value).toEqual(['a', 'b'])
  })
})

// =============================================================================
// Props
// =============================================================================
describe('Props', () => {
  test('passes disabled prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'select-button', disabled: true },
      }),
    })

    const sb = form.findComponent({ name: 'SelectButton' })
    expect(sb.props('disabled')).toBe(true)
  })

  test('is not disabled by default', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'select-button' },
      }),
    })

    const sb = form.findComponent({ name: 'SelectButton' })
    expect(sb.props('disabled')).toBe(false)
  })
})

// =============================================================================
// Validation (invalid state)
// =============================================================================
describe('Validation', () => {
  test('passes invalid state to SelectButton', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'select-button', rules: 'required' },
      }),
    })

    await el.validate()
    await nextTick()

    const sb = form.findComponent({ name: 'SelectButton' })
    expect(sb.props('invalid')).toBe(true)
  })
})

// =============================================================================
// Interaction events
// =============================================================================
describe('Interaction events', () => {
  test('handles focus event', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'select-button' },
      }),
    })

    const sb = form.findComponent({ name: 'SelectButton' })
    sb.vm.$emit('focus', new FocusEvent('focus'))
    await nextTick()

    expect(el.focused).toBe(true)
  })

  test('handles blur event', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'select-button' },
      }),
    })

    const sb = form.findComponent({ name: 'SelectButton' })
    sb.vm.$emit('focus', new FocusEvent('focus'))
    await nextTick()
    sb.vm.$emit('blur', new FocusEvent('blur'))
    await nextTick()

    expect(el.focused).toBe(false)
  })
})

// =============================================================================
// Forwarded events
// =============================================================================
describe('Forwarded events', () => {
  test('forwards value-change event', async () => {
    const onValueChange = vi.fn()
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'select-button', onValueChange },
      }),
    })

    const sb = form.findComponent({ name: 'SelectButton' })
    sb.vm.$emit('value-change', { value: 'a' })
    await nextTick()

    expect(onValueChange).toHaveBeenCalled()
  })
})

// =============================================================================
// Forwarded slots
// =============================================================================
describe('Forwarded slots', () => {
  describe('option slot via inline', () => {
    test('renders custom option slot', () => {
      const App = defineComponent({
        setup() {
          const VfForm = resolveComponent('VfForm')
          const VfSelectButton = resolveComponent('VfSelectButton')
          return () =>
            h(
              VfForm,
              {},
              {
                default: () =>
                  h(
                    VfSelectButton,
                    {
                      name: 'el',
                      options: [{ value: 'a', label: 'A' }],
                    },
                    {
                      option: (props: any) =>
                        h(
                          'span',
                          { class: 'custom-option' },
                          `Custom: ${props.option?.label ?? ''}`
                        ),
                    }
                  ),
              }
            )
        },
      })

      const wrapper = mountApp(App)
      const sb = wrapper.findComponent({ name: 'SelectButton' })
      expect(sb.exists()).toBe(true)
    })
  })

  describe('option slot via prop', () => {
    test('renders custom option via defineSlot', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'select-button',
            options: [{ value: 'a', label: 'A' }],
            slots: {
              option: defineSlot('VfSelectButton.option' as any, {
                props: ['option', 'index'],
                setup(props: any) {
                  return () =>
                    h(
                      'span',
                      { class: 'custom-option-slot' },
                      `Option: ${props.option?.label ?? ''}`
                    )
                },
              }),
            },
          },
        }),
      })

      const sb = form.findComponent({ name: 'SelectButton' })
      expect(sb.exists()).toBe(true)
    })
  })
})
