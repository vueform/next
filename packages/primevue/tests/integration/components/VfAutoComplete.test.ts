import { defineSchema, defineSlot } from '@vueform/primevue'
import { defineComponent, h, nextTick, resolveComponent } from 'vue'

import { createForm, mountApp } from '../../helpers'

// =============================================================================
// Basic rendering
// =============================================================================
describe('Basic rendering', () => {
  test('renders PrimeVue AutoComplete component', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'auto-complete' },
      }),
    })

    expect(form.findComponent({ name: 'AutoComplete' }).exists()).toBe(true)
  })

  test('renders with fluid prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'auto-complete' },
      }),
    })

    const ac = form.findComponent({ name: 'AutoComplete' })
    expect(ac.props('fluid')).toBe(true)
  })

  test('resolves PrimeVue passthrough props (e.g. minLength) on resolved props', () => {
    const { el, form } = createForm({
      schema: defineSchema({
        el: { type: 'auto-complete', minLength: 2 },
      }),
    })

    expect(el.props.minLength).toBe(2)

    const ac = form.findComponent({ name: 'AutoComplete' })
    expect(ac.props('minLength')).toBe(2)
  })
})

// =============================================================================
// Model binding
// =============================================================================
describe('Model binding', () => {
  test('has null default value', () => {
    const { el } = createForm({
      schema: defineSchema({
        el: { type: 'auto-complete' },
      }),
    })

    expect(el.value).toBeNull()
  })

  test('renders with custom default value', () => {
    const { el } = createForm({
      schema: defineSchema({
        el: {
          type: 'auto-complete',
          suggestions: ['Apple', 'Banana'],
          defaultValue: 'Apple',
        },
      }),
    })

    expect(el.value).toBe('Apple')
  })

  test('updates value on model-value update', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: {
          type: 'auto-complete',
          suggestions: ['Apple', 'Banana'],
        },
      }),
    })

    const ac = form.findComponent({ name: 'AutoComplete' })
    ac.vm.$emit('update:modelValue', 'Banana')
    await nextTick()

    expect(el.value).toBe('Banana')
  })
})

// =============================================================================
// Suggestions
// =============================================================================
describe('Suggestions', () => {
  test('passes suggestions to AutoComplete', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: {
          type: 'auto-complete',
          suggestions: ['Apple', 'Banana', 'Cherry'],
        },
      }),
    })

    const ac = form.findComponent({ name: 'AutoComplete' })
    expect(ac.props('suggestions')).toHaveLength(3)
  })
})

// =============================================================================
// Props
// =============================================================================
describe('Props', () => {
  test('passes placeholder prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'auto-complete', placeholder: 'Search...' },
      }),
    })

    const ac = form.findComponent({ name: 'AutoComplete' })
    expect(ac.props('placeholder')).toBe('Search...')
  })

  test('passes disabled prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'auto-complete', disabled: true },
      }),
    })

    const ac = form.findComponent({ name: 'AutoComplete' })
    expect(ac.props('disabled')).toBe(true)
  })

  test('is not disabled by default', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'auto-complete' },
      }),
    })

    const ac = form.findComponent({ name: 'AutoComplete' })
    expect(ac.props('disabled')).toBe(false)
  })

  test('passes loading prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'auto-complete', loading: true },
      }),
    })

    const ac = form.findComponent({ name: 'AutoComplete' })
    expect(ac.props('loading')).toBe(true)
  })
})

// =============================================================================
// Validation (invalid state)
// =============================================================================
describe('Validation', () => {
  test('passes invalid state to AutoComplete', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'auto-complete', rules: 'required' },
      }),
    })

    await el.validate()
    await nextTick()

    const ac = form.findComponent({ name: 'AutoComplete' })
    expect(ac.props('invalid')).toBe(true)
  })
})

// =============================================================================
// Interaction events
// =============================================================================
describe('Interaction events', () => {
  test('handles focus event', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'auto-complete' },
      }),
    })

    const ac = form.findComponent({ name: 'AutoComplete' })
    ac.vm.$emit('focus', new FocusEvent('focus'))
    await nextTick()

    expect(el.focused).toBe(true)
  })

  test('handles blur event', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'auto-complete' },
      }),
    })

    const ac = form.findComponent({ name: 'AutoComplete' })
    ac.vm.$emit('focus', new FocusEvent('focus'))
    await nextTick()
    ac.vm.$emit('blur', new FocusEvent('blur'))
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
        el: { type: 'auto-complete', onValueChange },
      }),
    })

    const ac = form.findComponent({ name: 'AutoComplete' })
    ac.vm.$emit('value-change', { value: 'Apple' })
    await nextTick()

    expect(onValueChange).toHaveBeenCalled()
  })

  test('forwards option-select event', async () => {
    const onOptionSelect = vi.fn()
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'auto-complete', onOptionSelect },
      }),
    })

    const ac = form.findComponent({ name: 'AutoComplete' })
    ac.vm.$emit('option-select', { value: 'Apple' })
    await nextTick()

    expect(onOptionSelect).toHaveBeenCalled()
  })

  test('forwards clear event', async () => {
    const onClear = vi.fn()
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'auto-complete', onClear },
      }),
    })

    const ac = form.findComponent({ name: 'AutoComplete' })
    ac.vm.$emit('clear')
    await nextTick()

    expect(onClear).toHaveBeenCalled()
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
          const VfAutoComplete = resolveComponent('VfAutoComplete')
          return () =>
            h(
              VfForm,
              {},
              {
                default: () =>
                  h(
                    VfAutoComplete,
                    {
                      name: 'el',
                      suggestions: ['Apple', 'Banana'],
                    },
                    {
                      option: (props: any) =>
                        h(
                          'span',
                          { class: 'custom-option' },
                          `Custom: ${props.option ?? ''}`
                        ),
                    }
                  ),
              }
            )
        },
      })

      const wrapper = mountApp(App)
      const ac = wrapper.findComponent({ name: 'AutoComplete' })
      expect(ac.exists()).toBe(true)
    })
  })

  describe('option slot via prop', () => {
    test('renders custom option via defineSlot', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'auto-complete',
            suggestions: ['Apple', 'Banana'],
            slots: {
              option: defineSlot('VfAutoComplete.option', {
                props: ['option', 'index'],
                setup(props: any) {
                  return () =>
                    h(
                      'span',
                      { class: 'custom-option-slot' },
                      `Option: ${props.option ?? ''}`
                    )
                },
              }),
            },
          },
        }),
      })

      const ac = form.findComponent({ name: 'AutoComplete' })
      expect(ac.exists()).toBe(true)
    })
  })
})
