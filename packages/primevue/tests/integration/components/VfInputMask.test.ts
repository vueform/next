import { defineSchema } from '@vueform/primevue'
import { defineComponent, h, nextTick, resolveComponent } from 'vue'
import { createForm, mountApp } from '../../helpers'

// =============================================================================
// Basic rendering
// =============================================================================
describe('Basic rendering', () => {
  test('renders PrimeVue InputMask component', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'input-mask', mask: '99-999999' },
      }),
    })

    expect(form.findComponent({ name: 'InputMask' }).exists()).toBe(true)
  })

  test('renders with mask prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'input-mask', mask: '(999) 999-9999' },
      }),
    })

    const input = form.findComponent({ name: 'InputMask' })
    expect(input.props('mask')).toBe('(999) 999-9999')
  })

  test('renders with placeholder', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: {
          type: 'input-mask',
          mask: '99/99/9999',
          placeholder: 'DD/MM/YYYY',
        },
      }),
    })

    const input = form.find('input')
    expect(input.attributes('placeholder')).toBe('DD/MM/YYYY')
  })

  test('renders with fluid prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'input-mask', mask: '99-99' },
      }),
    })

    const input = form.findComponent({ name: 'InputMask' })
    expect(input.props('fluid')).toBe(true)
  })
})

// =============================================================================
// Model binding
// =============================================================================
describe('Model binding', () => {
  test('has null default value', () => {
    const { el } = createForm({
      schema: defineSchema({
        el: { type: 'input-mask', mask: '99-99' },
      }),
    })

    expect(el.value).toBeNull()
  })

  test('renders with default value', () => {
    const { el } = createForm({
      schema: defineSchema({
        el: { type: 'input-mask', mask: '99-99', defaultValue: '12-34' },
      }),
    })

    expect(el.value).toBe('12-34')
  })

  test('updates value on model value change', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'input-mask', mask: '99-99' },
      }),
    })

    const input = form.findComponent({ name: 'InputMask' })
    input.vm.$emit('update:modelValue', '56-78')
    await nextTick()

    expect(el.value).toBe('56-78')
  })
})

// =============================================================================
// Mask-specific props
// =============================================================================
describe('Mask-specific props', () => {
  test('passes slotChar prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'input-mask', mask: '99-99', slotChar: '*' },
      }),
    })

    const input = form.findComponent({ name: 'InputMask' })
    expect(input.props('slotChar')).toBe('*')
  })

  test('passes unmask prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'input-mask', mask: '99-99', unmask: true },
      }),
    })

    const input = form.findComponent({ name: 'InputMask' })
    expect(input.props('unmask')).toBe(true)
  })

  test('passes autoClear prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'input-mask', mask: '99-99', autoClear: false },
      }),
    })

    const input = form.findComponent({ name: 'InputMask' })
    expect(input.props('autoClear')).toBe(false)
  })
})

// =============================================================================
// Disabled state
// =============================================================================
describe('Disabled state', () => {
  test('passes disabled prop to InputMask', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'input-mask', mask: '99-99', disabled: true },
      }),
    })

    const input = form.findComponent({ name: 'InputMask' })
    expect(input.props('disabled')).toBe(true)
  })

  test('is not disabled by default', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'input-mask', mask: '99-99' },
      }),
    })

    const input = form.findComponent({ name: 'InputMask' })
    expect(input.props('disabled')).toBe(false)
  })
})

// =============================================================================
// Readonly state
// =============================================================================
describe('Readonly state', () => {
  test('passes readonly prop to InputMask', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'input-mask', mask: '99-99', readonly: true },
      }),
    })

    const input = form.findComponent({ name: 'InputMask' })
    expect(input.props('readonly')).toBe(true)
  })
})

// =============================================================================
// Validation (invalid state)
// =============================================================================
describe('Validation', () => {
  test('passes invalid state to InputMask', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'input-mask', mask: '99-99', rules: 'required' },
      }),
    })

    await el.validate()
    await nextTick()

    const input = form.findComponent({ name: 'InputMask' })
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
        el: { type: 'input-mask', mask: '99-99' },
      }),
    })

    const input = form.findComponent({ name: 'InputMask' })
    input.vm.$emit('focus', new Event('focus'))
    await nextTick()

    expect(el.focused).toBe(true)
  })

  test('handles blur event', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'input-mask', mask: '99-99' },
      }),
    })

    const input = form.findComponent({ name: 'InputMask' })
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
        el: { type: 'input-mask', mask: '99-99', onValueChange },
      }),
    })

    const input = form.findComponent({ name: 'InputMask' })
    input.vm.$emit('value-change', '12-34')
    await nextTick()

    expect(onValueChange).toHaveBeenCalled()
  })

  test('forwards complete event', async () => {
    const onComplete = vi.fn()
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'input-mask', mask: '99-99', onComplete },
      }),
    })

    const input = form.findComponent({ name: 'InputMask' })
    input.vm.$emit('complete', new Event('complete'))
    await nextTick()

    expect(onComplete).toHaveBeenCalled()
  })

  test('forwards paste event', async () => {
    const onPaste = vi.fn()
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'input-mask', mask: '99-99', onPaste },
      }),
    })

    const input = form.findComponent({ name: 'InputMask' })
    input.vm.$emit('paste', new Event('paste'))
    await nextTick()

    expect(onPaste).toHaveBeenCalled()
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
        const VfInputMask = resolveComponent('VfInputMask')
        return () =>
          h(
            VfForm,
            {},
            {
              default: () =>
                h(
                  VfInputMask,
                  { name: 'el', mask: '99-99' },
                  {
                    template: () =>
                      h('div', { class: 'custom-mask' }, 'Custom'),
                  }
                ),
            }
          )
      },
    })

    const wrapper = mountApp(App)
    const custom = wrapper.find('.custom-mask')
    expect(custom.exists()).toBe(true)
    expect(custom.text()).toBe('Custom')
  })
})
