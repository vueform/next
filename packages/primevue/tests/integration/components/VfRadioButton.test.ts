import { defineSchema } from '@vueform/primevue'
import { defineComponent, h, nextTick, resolveComponent } from 'vue'

import { createForm, mountApp } from '../../helpers'

// =============================================================================
// Basic rendering
// =============================================================================
describe('Basic rendering', () => {
  test('renders PrimeVue RadioButton component', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'radio-button' },
      }),
    })

    expect(form.findComponent({ name: 'RadioButton' }).exists()).toBe(true)
  })

  test('renders with text label', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'radio-button', text: 'Option A' },
      }),
    })

    const label = form.find('.vf-choice-text')
    expect(label.exists()).toBe(true)
    expect(label.text()).toBe('Option A')
  })

  test('renders sr-only label when no text is provided', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'radio-button' },
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
  test('has null default value', () => {
    const { el } = createForm({
      schema: defineSchema({
        el: { type: 'radio-button' },
      }),
    })

    expect(el.value).toBeNull()
  })

  test('sets value when selected', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'radio-button', value: 'a' },
      }),
    })

    const radio = form.findComponent({ name: 'RadioButton' })
    radio.vm.$emit('update:modelValue', 'a')
    await nextTick()

    expect(el.value).toBe('a')
  })

  test('supports custom value', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'radio-button', value: 42, defaultValue: 42 },
      }),
    })

    expect(el.value).toBe(42)

    const radio = form.findComponent({ name: 'RadioButton' })
    expect(radio.props('value')).toBe(42)
  })

  test('passes value as value prop to RadioButton', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'radio-button', value: 'option-1' },
      }),
    })

    const radio = form.findComponent({ name: 'RadioButton' })
    expect(radio.props('value')).toBe('option-1')
  })
})

// =============================================================================
// Disabled state
// =============================================================================
describe('Disabled state', () => {
  test('passes disabled prop to RadioButton', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'radio-button', disabled: true },
      }),
    })

    const radio = form.findComponent({ name: 'RadioButton' })
    expect(radio.props('disabled')).toBe(true)
  })

  test('is not disabled by default', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'radio-button' },
      }),
    })

    const radio = form.findComponent({ name: 'RadioButton' })
    expect(radio.props('disabled')).toBe(false)
  })
})

// =============================================================================
// Validation (invalid state)
// =============================================================================
describe('Validation', () => {
  test('passes invalid state to RadioButton', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'radio-button', rules: 'required' },
      }),
    })

    await el.validate()
    await nextTick()

    const radio = form.findComponent({ name: 'RadioButton' })
    expect(radio.props('invalid')).toBe(true)
  })
})

// =============================================================================
// Interaction events
// =============================================================================
describe('Interaction events', () => {
  test('handles focus event', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'radio-button' },
      }),
    })

    const radio = form.findComponent({ name: 'RadioButton' })
    radio.vm.$emit('focus', new FocusEvent('focus'))
    await nextTick()

    expect(el.focused).toBe(true)
  })

  test('handles blur event', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'radio-button' },
      }),
    })

    const radio = form.findComponent({ name: 'RadioButton' })
    radio.vm.$emit('focus', new FocusEvent('focus'))
    await nextTick()
    radio.vm.$emit('blur', new FocusEvent('blur'))
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
        el: { type: 'radio-button', onValueChange },
      }),
    })

    const radio = form.findComponent({ name: 'RadioButton' })
    radio.vm.$emit('value-change', 'a')
    await nextTick()

    expect(onValueChange).toHaveBeenCalled()
  })
})

// =============================================================================
// Text label alignment
// =============================================================================
describe('Text label alignment', () => {
  test('applies left alignment attribute', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'radio-button', text: 'Label', align: 'left' },
      }),
    })

    const wrapper = form.find('.vf-choice-wrapper')
    expect(wrapper.attributes('data-align')).toBe('left')
  })

  test('applies right alignment attribute', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'radio-button', text: 'Label', align: 'right' },
      }),
    })

    const wrapper = form.find('.vf-choice-wrapper')
    expect(wrapper.attributes('data-align')).toBe('right')
  })
})

// =============================================================================
// Readonly state
// =============================================================================
describe('Readonly state', () => {
  test('passes readonly prop to RadioButton', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'radio-button', readonly: true },
      }),
    })

    const radio = form.findComponent({ name: 'RadioButton' })
    expect(radio.props('readonly')).toBe(true)
  })
})

// =============================================================================
// Default slot
// =============================================================================
describe('Default slot', () => {
  test('renders custom default slot via inline', () => {
    const App = defineComponent({
      setup() {
        const VfForm = resolveComponent('VfForm')
        const VfRadioButton = resolveComponent('VfRadioButton')
        return () =>
          h(
            VfForm,
            {},
            {
              default: () =>
                h(
                  VfRadioButton,
                  { name: 'el', value: 'a' },
                  {
                    default: (props: any) =>
                      h('div', { class: 'custom-radio' }, [
                        h('span', {}, `Value: ${props.value}`),
                      ]),
                  }
                ),
            }
          )
      },
    })

    const wrapper = mountApp(App)
    const custom = wrapper.find('.custom-radio')
    expect(custom.exists()).toBe(true)
    expect(custom.text()).toContain('Value: a')
  })
})
