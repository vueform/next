import { defineComponent, h, nextTick, resolveComponent } from 'vue'

import { defineSchema } from '#primevue'

import { createForm, mountApp } from '../../helpers'

// =============================================================================
// Basic rendering
// =============================================================================
describe('Basic rendering', () => {
  test('renders PrimeVue InputNumber component', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'input-number' },
      }),
    })

    expect(form.findComponent({ name: 'InputNumber' }).exists()).toBe(true)
  })

  test('renders with placeholder', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'input-number', placeholder: 'Enter number' },
      }),
    })

    const input = form.findComponent({ name: 'InputNumber' })
    expect(input.props('placeholder')).toBe('Enter number')
  })

  test('renders with fluid prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'input-number' },
      }),
    })

    const input = form.findComponent({ name: 'InputNumber' })
    expect(input.props('fluid')).toBe(true)
  })

  test('passes inputId from element id', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'input-number', id: 'my-number' },
      }),
    })

    const input = form.findComponent({ name: 'InputNumber' })
    expect(input.props('inputId')).toBe('my-number')
  })
})

// =============================================================================
// Model binding
// =============================================================================
describe('Model binding', () => {
  test('has null default value', () => {
    const { el } = createForm({
      schema: defineSchema({
        el: { type: 'input-number' },
      }),
    })

    expect(el.value).toBeNull()
  })

  test('renders with default value', () => {
    const { el } = createForm({
      schema: defineSchema({
        el: { type: 'input-number', defaultValue: 42 },
      }),
    })

    expect(el.value).toBe(42)
  })

  test('updates value on model value change', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'input-number' },
      }),
    })

    const input = form.findComponent({ name: 'InputNumber' })
    input.vm.$emit('update:modelValue', 100)
    await nextTick()

    expect(el.value).toBe(100)
  })
})

// =============================================================================
// Number-specific props
// =============================================================================
describe('Number-specific props', () => {
  test('passes min and max props', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'input-number', min: 0, max: 100 },
      }),
    })

    const input = form.findComponent({ name: 'InputNumber' })
    expect(input.props('min')).toBe(0)
    expect(input.props('max')).toBe(100)
  })

  test('passes step prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'input-number', step: 5 },
      }),
    })

    const input = form.findComponent({ name: 'InputNumber' })
    expect(input.props('step')).toBe(5)
  })

  test('passes showButtons prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'input-number', showButtons: true },
      }),
    })

    const input = form.findComponent({ name: 'InputNumber' })
    expect(input.props('showButtons')).toBe(true)
  })

  test('passes currency mode props', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'input-number', mode: 'currency', currency: 'USD' },
      }),
    })

    const input = form.findComponent({ name: 'InputNumber' })
    expect(input.props('mode')).toBe('currency')
    expect(input.props('currency')).toBe('USD')
  })

  test('passes minFractionDigits and maxFractionDigits', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: {
          type: 'input-number',
          minFractionDigits: 2,
          maxFractionDigits: 4,
        },
      }),
    })

    const input = form.findComponent({ name: 'InputNumber' })
    expect(input.props('minFractionDigits')).toBe(2)
    expect(input.props('maxFractionDigits')).toBe(4)
  })

  test('passes prefix and suffix', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'input-number', prefix: '$', suffix: ' USD' },
      }),
    })

    const input = form.findComponent({ name: 'InputNumber' })
    expect(input.props('prefix')).toBe('$')
    expect(input.props('suffix')).toBe(' USD')
  })
})

// =============================================================================
// Disabled state
// =============================================================================
describe('Disabled state', () => {
  test('passes disabled prop to InputNumber', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'input-number', disabled: true },
      }),
    })

    const input = form.findComponent({ name: 'InputNumber' })
    expect(input.props('disabled')).toBe(true)
  })

  test('is not disabled by default', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'input-number' },
      }),
    })

    const input = form.findComponent({ name: 'InputNumber' })
    expect(input.props('disabled')).toBe(false)
  })
})

// =============================================================================
// Readonly state
// =============================================================================
describe('Readonly state', () => {
  test('passes readonly prop to InputNumber', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'input-number', readonly: true },
      }),
    })

    const input = form.findComponent({ name: 'InputNumber' })
    expect(input.props('readonly')).toBe(true)
  })
})

// =============================================================================
// Validation (invalid state)
// =============================================================================
describe('Validation', () => {
  test('passes invalid state to InputNumber', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'input-number', rules: 'required' },
      }),
    })

    await el.validate()
    await nextTick()

    const input = form.findComponent({ name: 'InputNumber' })
    expect(input.props('invalid')).toBe(true)
  })
})

// =============================================================================
// Interaction events
// =============================================================================
describe('Interaction events', () => {
  test('handles focus event', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'input-number' },
      }),
    })

    const input = form.findComponent({ name: 'InputNumber' })
    input.vm.$emit('focus', new Event('focus'))
    await nextTick()

    expect(el.focused).toBe(true)
  })

  test('handles blur event', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'input-number' },
      }),
    })

    const input = form.findComponent({ name: 'InputNumber' })
    input.vm.$emit('focus', new Event('focus'))
    await nextTick()
    input.vm.$emit('blur', { originalEvent: new Event('blur'), value: '0' })
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
        el: { type: 'input-number', onValueChange },
      }),
    })

    const input = form.findComponent({ name: 'InputNumber' })
    input.vm.$emit('value-change', 42)
    await nextTick()

    expect(onValueChange).toHaveBeenCalled()
  })
})

// =============================================================================
// Template slot
// =============================================================================
describe('Template slot', () => {
  test('renders custom template slot via inline', () => {
    const App = defineComponent({
      setup() {
        const VfForm = resolveComponent('VfForm')
        const VfInputNumber = resolveComponent('VfInputNumber')
        return () =>
          h(
            VfForm,
            {},
            {
              default: () =>
                h(
                  VfInputNumber,
                  { name: 'el' },
                  {
                    template: () =>
                      h('div', { class: 'custom-number' }, 'Custom'),
                  }
                ),
            }
          )
      },
    })

    const wrapper = mountApp(App)
    const custom = wrapper.find('.custom-number')
    expect(custom.exists()).toBe(true)
    expect(custom.text()).toBe('Custom')
  })
})
