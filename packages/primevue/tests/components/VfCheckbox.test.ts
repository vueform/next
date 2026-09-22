import { defineSchema, defineSlot } from '@vueform/primevue'
import { defineComponent, h, nextTick, resolveComponent } from 'vue'
import { createForm, mountApp } from '../helpers'

// =============================================================================
// Basic rendering
// =============================================================================
describe('Basic rendering', () => {
  test('renders PrimeVue Checkbox component', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'checkbox' },
      }),
    })

    expect(form.findComponent({ name: 'Checkbox' }).exists()).toBe(true)
  })

  test('renders with text label', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'checkbox', text: 'Accept terms' },
      }),
    })

    const label = form.find('.vf-choice-text')
    expect(label.exists()).toBe(true)
    expect(label.text()).toBe('Accept terms')
  })

  test('renders sr-only label when no text is provided', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'checkbox' },
      }),
    })

    const label = form.find('.sr-only')
    expect(label.exists()).toBe(true)
  })
})

// =============================================================================
// Model binding
// =============================================================================
describe('Model binding', () => {
  test('has false default value', () => {
    const { el } = createForm({
      schema: defineSchema({
        el: { type: 'checkbox' },
      }),
    })

    expect(el.value).toBe(false)
  })

  test('sets true value when checked', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'checkbox' },
      }),
    })

    const checkbox = form.findComponent({ name: 'Checkbox' })
    checkbox.vm.$emit('update:modelValue', true)
    await nextTick()

    expect(el.value).toBe(true)
  })

  test('supports custom trueValue and falseValue', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: {
          type: 'checkbox',
          trueValue: 'yes',
          falseValue: 'no',
          defaultValue: 'no',
        },
      }),
    })

    expect(el.value).toBe('no')

    const checkbox = form.findComponent({ name: 'Checkbox' })
    checkbox.vm.$emit('update:modelValue', 'yes')
    await nextTick()

    expect(el.value).toBe('yes')
  })

  test('passes binary prop to PrimeVue Checkbox', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'checkbox' },
      }),
    })

    const checkbox = form.findComponent({ name: 'Checkbox' })
    expect(checkbox.props('binary')).toBe(true)
  })
})

// =============================================================================
// Disabled state
// =============================================================================
describe('Disabled state', () => {
  test('passes disabled prop to Checkbox', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'checkbox', disabled: true },
      }),
    })

    const checkbox = form.findComponent({ name: 'Checkbox' })
    expect(checkbox.props('disabled')).toBe(true)
  })

  test('is not disabled by default', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'checkbox' },
      }),
    })

    const checkbox = form.findComponent({ name: 'Checkbox' })
    expect(checkbox.props('disabled')).toBe(false)
  })
})

// =============================================================================
// Validation (invalid state)
// =============================================================================
describe('Validation', () => {
  test('passes invalid state to Checkbox', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'checkbox', rules: 'accepted' },
      }),
    })

    await el.validate()
    await nextTick()

    const checkbox = form.findComponent({ name: 'Checkbox' })
    expect(checkbox.props('invalid')).toBe(true)
  })
})

// =============================================================================
// Interaction events
// =============================================================================
describe('Interaction events', () => {
  test('handles focus event', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'checkbox' },
      }),
    })

    const checkbox = form.findComponent({ name: 'Checkbox' })
    checkbox.vm.$emit('focus', new FocusEvent('focus'))
    await nextTick()

    expect(el.focused).toBe(true)
  })

  test('handles blur event', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'checkbox' },
      }),
    })

    const checkbox = form.findComponent({ name: 'Checkbox' })
    checkbox.vm.$emit('focus', new FocusEvent('focus'))
    await nextTick()
    checkbox.vm.$emit('blur', new FocusEvent('blur'))
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
        el: { type: 'checkbox', onValueChange },
      }),
    })

    const checkbox = form.findComponent({ name: 'Checkbox' })
    checkbox.vm.$emit('value-change', true)
    await nextTick()

    expect(onValueChange).toHaveBeenCalled()
  })

  test('forwards update:indeterminate event', async () => {
    const onUpdateIndeterminate = vi.fn()
    const { form } = createForm({
      schema: defineSchema({
        el: {
          type: 'checkbox',
          indeterminate: true,
          'onUpdate:indeterminate': onUpdateIndeterminate,
        },
      }),
    })

    const checkbox = form.findComponent({ name: 'Checkbox' })
    checkbox.vm.$emit('update:indeterminate', false)
    await nextTick()

    expect(onUpdateIndeterminate).toHaveBeenCalled()
  })
})

// =============================================================================
// Forwarded slots
// =============================================================================
describe('Forwarded slots', () => {
  describe('icon slot via inline', () => {
    test('renders custom icon slot', () => {
      const App = defineComponent({
        setup() {
          const VfForm = resolveComponent('VfForm')
          const VfCheckbox = resolveComponent('VfCheckbox')
          return () =>
            h(
              VfForm,
              {},
              {
                default: () =>
                  h(
                    VfCheckbox,
                    { name: 'el' },
                    {
                      icon: (props: any) =>
                        h(
                          'span',
                          { class: 'custom-icon' },
                          props.checked ? '✓' : ''
                        ),
                    }
                  ),
              }
            )
        },
      })

      const wrapper = mountApp(App)
      const icon = wrapper.find('.custom-icon')
      expect(icon.exists()).toBe(true)
    })
  })

  describe('icon slot via prop', () => {
    test('renders custom icon via defineSlot', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'checkbox',
            slots: {
              icon: defineSlot('VfCheckbox.icon' as any, {
                props: ['checked', 'indeterminate', 'class'],
                setup(props: any) {
                  return () =>
                    h(
                      'span',
                      { class: 'custom-icon-slot' },
                      props.checked ? '✓' : '○'
                    )
                },
              }),
            },
          },
        }),
      })

      const icon = form.find('.custom-icon-slot')
      expect(icon.exists()).toBe(true)
    })
  })
})

// =============================================================================
// Text label alignment
// =============================================================================
describe('Text label alignment', () => {
  test('applies left alignment class', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'checkbox', text: 'Label', align: 'left' },
      }),
    })

    const wrapper = form.find('.vf-choice-wrapper')
    expect(wrapper.classes()).toContain('vf-left')
  })

  test('applies right alignment class', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'checkbox', text: 'Label', align: 'right' },
      }),
    })

    const wrapper = form.find('.vf-choice-wrapper')
    expect(wrapper.classes()).toContain('vf-right')
  })
})

// =============================================================================
// PrimeVue passthrough props
// =============================================================================
describe('Passthrough props', () => {
  test('passes indeterminate to Checkbox', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'checkbox', indeterminate: true },
      }),
    })

    const checkbox = form.findComponent({ name: 'Checkbox' })
    expect(checkbox.props('indeterminate')).toBe(true)
  })
})
