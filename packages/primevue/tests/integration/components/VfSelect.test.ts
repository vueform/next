import { defineComponent, h, nextTick, resolveComponent } from 'vue'

import { defineSchema, defineSlot } from '#primevue'

import { createForm, mountApp } from '../../helpers'

// =============================================================================
// Basic rendering
// =============================================================================
describe('Basic rendering', () => {
  test('renders PrimeVue Select component', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'select' },
      }),
    })

    expect(form.findComponent({ name: 'Select' }).exists()).toBe(true)
  })

  test('renders with fluid prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'select' },
      }),
    })

    const select = form.findComponent({ name: 'Select' })
    expect(select.props('fluid')).toBe(true)
  })
})

// =============================================================================
// Model binding
// =============================================================================
describe('Model binding', () => {
  test('has null default value', () => {
    const { el } = createForm({
      schema: defineSchema({
        el: { type: 'select' },
      }),
    })

    expect(el.value).toBeNull()
  })

  test('renders with custom default value', () => {
    const { el } = createForm({
      schema: defineSchema({
        el: {
          type: 'select',
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
          type: 'select',
          options: [
            { value: 'a', label: 'A' },
            { value: 'b', label: 'B' },
          ],
        },
      }),
    })

    const select = form.findComponent({ name: 'Select' })
    select.vm.$emit('update:modelValue', 'b')
    await nextTick()

    expect(el.value).toBe('b')
  })
})

// =============================================================================
// Options
// =============================================================================
describe('Options', () => {
  test('passes options to Select', () => {
    const opts = [
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B' },
    ]

    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'select', options: opts },
      }),
    })

    const select = form.findComponent({ name: 'Select' })
    expect(select.props('options')).toHaveLength(2)
  })

  test('passes optionLabel and optionValue', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: {
          type: 'select',
          options: [{ code: 'us', name: 'United States' }],
          optionValue: 'code',
          optionLabel: 'name',
        },
      }),
    })

    const select = form.findComponent({ name: 'Select' })
    expect(select.props('optionLabel')).toBe('name')
    expect(select.props('optionValue')).toBe('code')
  })
})

// =============================================================================
// Props
// =============================================================================
describe('Props', () => {
  test('passes placeholder prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'select', placeholder: 'Pick one' },
      }),
    })

    const select = form.findComponent({ name: 'Select' })
    expect(select.props('placeholder')).toBe('Pick one')
  })

  test('passes disabled prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'select', disabled: true },
      }),
    })

    const select = form.findComponent({ name: 'Select' })
    expect(select.props('disabled')).toBe(true)
  })

  test('is not disabled by default', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'select' },
      }),
    })

    const select = form.findComponent({ name: 'Select' })
    expect(select.props('disabled')).toBe(false)
  })

  test('passes loading prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'select', loading: true },
      }),
    })

    const select = form.findComponent({ name: 'Select' })
    expect(select.props('loading')).toBe(true)
  })
})

// =============================================================================
// Validation (invalid state)
// =============================================================================
describe('Validation', () => {
  test('passes invalid state to Select', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'select', rules: 'required' },
      }),
    })

    await el.validate()
    await nextTick()

    const select = form.findComponent({ name: 'Select' })
    expect(select.props('invalid')).toBe(true)
  })
})

// =============================================================================
// Interaction events
// =============================================================================
describe('Interaction events', () => {
  test('handles focus event', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'select' },
      }),
    })

    const select = form.findComponent({ name: 'Select' })
    select.vm.$emit('focus', new FocusEvent('focus'))
    await nextTick()

    expect(el.focused).toBe(true)
  })

  test('handles blur event', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'select' },
      }),
    })

    const select = form.findComponent({ name: 'Select' })
    select.vm.$emit('focus', new FocusEvent('focus'))
    await nextTick()
    select.vm.$emit('blur', new FocusEvent('blur'))
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
        el: { type: 'select', onValueChange },
      }),
    })

    const select = form.findComponent({ name: 'Select' })
    select.vm.$emit('value-change', { value: 'a' })
    await nextTick()

    expect(onValueChange).toHaveBeenCalled()
  })

  test('forwards show event', async () => {
    const onShow = vi.fn()
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'select', onShow },
      }),
    })

    const select = form.findComponent({ name: 'Select' })
    select.vm.$emit('show')
    await nextTick()

    expect(onShow).toHaveBeenCalled()
  })

  test('forwards hide event', async () => {
    const onHide = vi.fn()
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'select', onHide },
      }),
    })

    const select = form.findComponent({ name: 'Select' })
    select.vm.$emit('hide')
    await nextTick()

    expect(onHide).toHaveBeenCalled()
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
          const VfSelect = resolveComponent('VfSelect')
          return () =>
            h(
              VfForm,
              {},
              {
                default: () =>
                  h(
                    VfSelect,
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
      const select = wrapper.findComponent({ name: 'Select' })
      expect(select.exists()).toBe(true)
    })
  })

  describe('option slot via prop', () => {
    test('renders custom option via defineSlot', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'select',
            options: [{ value: 'a', label: 'A' }],
            slots: {
              option: defineSlot('VfSelect.option', {
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

      const select = form.findComponent({ name: 'Select' })
      expect(select.exists()).toBe(true)
    })
  })
})
