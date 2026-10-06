import { defineComponent, h, nextTick, resolveComponent } from 'vue'

import { defineSchema } from '#primevue'

import { createForm, mountApp } from '../../helpers'

// =============================================================================
// Basic rendering
// =============================================================================
describe('Basic rendering', () => {
  test('renders PrimeVue InputOtp component', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'input-otp' },
      }),
    })

    expect(form.findComponent({ name: 'InputOtp' }).exists()).toBe(true)
  })

  test('renders with default length of 4', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'input-otp' },
      }),
    })

    const input = form.findComponent({ name: 'InputOtp' })
    expect(input.props('length')).toBe(4)
  })

  test('renders with custom length', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'input-otp', length: 6 },
      }),
    })

    const input = form.findComponent({ name: 'InputOtp' })
    expect(input.props('length')).toBe(6)
  })
})

// =============================================================================
// Model binding
// =============================================================================
describe('Model binding', () => {
  test('has null default value', () => {
    const { el } = createForm({
      schema: defineSchema({
        el: { type: 'input-otp' },
      }),
    })

    expect(el.value).toBeNull()
  })

  test('renders with default value', () => {
    const { el } = createForm({
      schema: defineSchema({
        el: { type: 'input-otp', defaultValue: '1234' },
      }),
    })

    expect(el.value).toBe('1234')
  })

  test('updates value via element update', async () => {
    const { el } = createForm({
      schema: defineSchema({
        el: { type: 'input-otp', defaultValue: '1234' },
      }),
    })

    el.update('abcd')
    await nextTick()

    expect(el.value).toBe('abcd')
  })
})

// =============================================================================
// OTP-specific props
// =============================================================================
describe('OTP-specific props', () => {
  test('passes mask prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'input-otp', mask: true },
      }),
    })

    const input = form.findComponent({ name: 'InputOtp' })
    expect(input.props('mask')).toBe(true)
  })

  test('passes integerOnly prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'input-otp', integerOnly: true },
      }),
    })

    const input = form.findComponent({ name: 'InputOtp' })
    expect(input.props('integerOnly')).toBe(true)
  })
})

// =============================================================================
// Disabled state
// =============================================================================
describe('Disabled state', () => {
  test('passes disabled prop to InputOtp', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'input-otp', disabled: true },
      }),
    })

    const input = form.findComponent({ name: 'InputOtp' })
    expect(input.props('disabled')).toBe(true)
  })

  test('is not disabled by default', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'input-otp' },
      }),
    })

    const input = form.findComponent({ name: 'InputOtp' })
    expect(input.props('disabled')).toBe(false)
  })
})

// =============================================================================
// Readonly state
// =============================================================================
describe('Readonly state', () => {
  test('passes readonly prop to InputOtp', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'input-otp', readonly: true },
      }),
    })

    const input = form.findComponent({ name: 'InputOtp' })
    expect(input.props('readonly')).toBe(true)
  })
})

// =============================================================================
// Validation (invalid state)
// =============================================================================
describe('Validation', () => {
  test('passes invalid state to InputOtp', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'input-otp', rules: 'required' },
      }),
    })

    await el.validate()
    await nextTick()

    const input = form.findComponent({ name: 'InputOtp' })
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
        el: { type: 'input-otp' },
      }),
    })

    const input = form.findComponent({ name: 'InputOtp' })
    input.vm.$emit('focus', new Event('focus'))
    await nextTick()

    expect(el.focused).toBe(true)
  })

  test('handles blur event', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'input-otp' },
      }),
    })

    const input = form.findComponent({ name: 'InputOtp' })
    input.vm.$emit('focus', new Event('focus'))
    await nextTick()
    input.vm.$emit('blur', new Event('blur'))
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
        el: { type: 'input-otp', onValueChange },
      }),
    })

    const input = form.findComponent({ name: 'InputOtp' })
    input.vm.$emit('value-change', '1234')
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
        const VfInputOtp = resolveComponent('VfInputOtp')
        return () =>
          h(
            VfForm,
            {},
            {
              default: () =>
                h(
                  VfInputOtp,
                  { name: 'el' },
                  {
                    template: () => h('div', { class: 'custom-otp' }, 'Custom'),
                  }
                ),
            }
          )
      },
    })

    const wrapper = mountApp(App)
    const custom = wrapper.find('.custom-otp')
    expect(custom.exists()).toBe(true)
    expect(custom.text()).toBe('Custom')
  })
})
