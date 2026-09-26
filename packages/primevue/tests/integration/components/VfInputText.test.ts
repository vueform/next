import { defineComponent, h, nextTick, resolveComponent } from 'vue'
import { createForm, mountApp } from '../../helpers'
import { defineSchema } from '#primevue'

// =============================================================================
// Basic rendering
// =============================================================================
describe('Basic rendering', () => {
  test('renders PrimeVue InputText component', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'input-text' },
      }),
    })

    expect(form.findComponent({ name: 'InputText' }).exists()).toBe(true)
  })

  test('renders with placeholder', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'input-text', placeholder: 'Enter text' },
      }),
    })

    const input = form.find('input')
    expect(input.attributes('placeholder')).toBe('Enter text')
  })

  test('renders with fluid prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'input-text' },
      }),
    })

    const input = form.findComponent({ name: 'InputText' })
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
        el: { type: 'input-text' },
      }),
    })

    expect(el.value).toBeNull()
  })

  test('renders with default value', () => {
    const { el } = createForm({
      schema: defineSchema({
        el: { type: 'input-text', defaultValue: 'hello' },
      }),
    })

    expect(el.value).toBe('hello')
  })

  test('updates value on input event', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'input-text' },
      }),
    })

    const input = form.find('input')
    await input.setValue('new value')
    await nextTick()

    expect(el.value).toBe('new value')
  })
})

// =============================================================================
// Input type
// =============================================================================
describe('Input type', () => {
  test('defaults to text type', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'input-text' },
      }),
    })

    const input = form.find('input')
    expect(input.attributes('type')).toBe('text')
  })

  test('supports email type', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'input-text', inputType: 'email' },
      }),
    })

    const input = form.find('input')
    expect(input.attributes('type')).toBe('email')
  })

  test('supports password type', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'input-text', inputType: 'password' },
      }),
    })

    const input = form.find('input')
    expect(input.attributes('type')).toBe('password')
  })
})

// =============================================================================
// Disabled state
// =============================================================================
describe('Disabled state', () => {
  test('passes disabled prop to InputText', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'input-text', disabled: true },
      }),
    })

    const input = form.findComponent({ name: 'InputText' })
    expect(input.props('disabled')).toBe(true)
  })

  test('is not disabled by default', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'input-text' },
      }),
    })

    const input = form.findComponent({ name: 'InputText' })
    expect(input.props('disabled')).toBe(false)
  })
})

// =============================================================================
// Readonly state
// =============================================================================
describe('Readonly state', () => {
  test('passes readonly attribute to input', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'input-text', readonly: true },
      }),
    })

    const input = form.find('input')
    expect(input.attributes('readonly')).toBeDefined()
  })
})

// =============================================================================
// Validation (invalid state)
// =============================================================================
describe('Validation', () => {
  test('passes invalid state to InputText', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'input-text', rules: 'required' },
      }),
    })

    await el.validate()
    await nextTick()

    const input = form.findComponent({ name: 'InputText' })
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
        el: { type: 'input-text' },
      }),
    })

    const input = form.find('input')
    await input.trigger('focus')
    await nextTick()

    expect(el.focused).toBe(true)
  })

  test('handles blur event', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'input-text' },
      }),
    })

    const input = form.find('input')
    await input.trigger('focus')
    await nextTick()
    await input.trigger('blur')
    await nextTick()

    expect(el.focused).toBe(false)
  })
})

// =============================================================================
// Autocomplete
// =============================================================================
describe('Autocomplete', () => {
  test('passes autocomplete attribute to input', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'input-text', autocomplete: 'email' },
      }),
    })

    const input = form.find('input')
    expect(input.attributes('autocomplete')).toBe('email')
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
        el: { type: 'input-text', onValueChange },
      }),
    })

    const input = form.findComponent({ name: 'InputText' })
    input.vm.$emit('value-change', 'test')
    await nextTick()

    expect(onValueChange).toHaveBeenCalled()
  })
})

// =============================================================================
// Default slot
// =============================================================================
describe('Default slot', () => {
  test('renders custom template slot via inline', () => {
    const App = defineComponent({
      setup() {
        const VfForm = resolveComponent('VfForm')
        const VfInputText = resolveComponent('VfInputText')
        return () =>
          h(
            VfForm,
            {},
            {
              default: () =>
                h(
                  VfInputText,
                  { name: 'el' },
                  {
                    template: () =>
                      h('div', { class: 'custom-input' }, 'Custom'),
                  }
                ),
            }
          )
      },
    })

    const wrapper = mountApp(App)
    const custom = wrapper.find('.custom-input')
    expect(custom.exists()).toBe(true)
    expect(custom.text()).toBe('Custom')
  })
})
