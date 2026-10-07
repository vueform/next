import { defineSchema, defineSlot } from '@vueform/primevue'
import { defineComponent, h, nextTick, resolveComponent } from 'vue'

import { createForm, mountApp } from '../../helpers'

// =============================================================================
// Basic rendering
// =============================================================================
describe('Basic rendering', () => {
  test('renders PrimeVue MultiSelect component', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'multi-select' },
      }),
    })

    expect(form.findComponent({ name: 'MultiSelect' }).exists()).toBe(true)
  })

  test('renders with fluid prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'multi-select' },
      }),
    })

    const ms = form.findComponent({ name: 'MultiSelect' })
    expect(ms.props('fluid')).toBe(true)
  })
})

// =============================================================================
// Model binding
// =============================================================================
describe('Model binding', () => {
  test('has empty array default value', () => {
    const { el } = createForm({
      schema: defineSchema({
        el: { type: 'multi-select' },
      }),
    })

    expect(el.value).toEqual([])
  })

  test('renders with custom default value', () => {
    const { el } = createForm({
      schema: defineSchema({
        el: {
          type: 'multi-select',
          options: [
            { value: 'a', label: 'A' },
            { value: 'b', label: 'B' },
          ],
          defaultValue: ['a'],
        },
      }),
    })

    expect(el.value).toEqual(['a'])
  })

  test('updates value on model-value update', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: {
          type: 'multi-select',
          options: [
            { value: 'a', label: 'A' },
            { value: 'b', label: 'B' },
          ],
        },
      }),
    })

    const ms = form.findComponent({ name: 'MultiSelect' })
    ms.vm.$emit('update:modelValue', ['a', 'b'])
    await nextTick()

    expect(el.value).toEqual(['a', 'b'])
  })
})

// =============================================================================
// Options
// =============================================================================
describe('Options', () => {
  test('passes options to MultiSelect', () => {
    const opts = [
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B' },
    ]

    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'multi-select', options: opts },
      }),
    })

    const ms = form.findComponent({ name: 'MultiSelect' })
    expect(ms.props('options')).toHaveLength(2)
  })

  test('passes optionLabel and optionValue', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: {
          type: 'multi-select',
          options: [{ code: 'us', name: 'United States' }],
          optionValue: 'code',
          optionLabel: 'name',
        },
      }),
    })

    const ms = form.findComponent({ name: 'MultiSelect' })
    expect(ms.props('optionLabel')).toBe('name')
    expect(ms.props('optionValue')).toBe('code')
  })
})

// =============================================================================
// Props
// =============================================================================
describe('Props', () => {
  test('passes placeholder prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'multi-select', placeholder: 'Select items' },
      }),
    })

    const ms = form.findComponent({ name: 'MultiSelect' })
    expect(ms.props('placeholder')).toBe('Select items')
  })

  test('passes disabled prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'multi-select', disabled: true },
      }),
    })

    const ms = form.findComponent({ name: 'MultiSelect' })
    expect(ms.props('disabled')).toBe(true)
  })

  test('is not disabled by default', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'multi-select' },
      }),
    })

    const ms = form.findComponent({ name: 'MultiSelect' })
    expect(ms.props('disabled')).toBe(false)
  })

  test('passes loading prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'multi-select', loading: true },
      }),
    })

    const ms = form.findComponent({ name: 'MultiSelect' })
    expect(ms.props('loading')).toBe(true)
  })
})

// =============================================================================
// Validation (invalid state)
// =============================================================================
describe('Validation', () => {
  test('passes invalid state to MultiSelect', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'multi-select', rules: 'required' },
      }),
    })

    await el.validate()
    await nextTick()

    const ms = form.findComponent({ name: 'MultiSelect' })
    expect(ms.props('invalid')).toBe(true)
  })
})

// =============================================================================
// Interaction events
// =============================================================================
describe('Interaction events', () => {
  test('handles focus event', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'multi-select' },
      }),
    })

    const ms = form.findComponent({ name: 'MultiSelect' })
    ms.vm.$emit('focus', new FocusEvent('focus'))
    await nextTick()

    expect(el.focused).toBe(true)
  })

  test('handles blur event', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'multi-select' },
      }),
    })

    const ms = form.findComponent({ name: 'MultiSelect' })
    ms.vm.$emit('focus', new FocusEvent('focus'))
    await nextTick()
    ms.vm.$emit('blur', new FocusEvent('blur'))
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
        el: { type: 'multi-select', onValueChange },
      }),
    })

    const ms = form.findComponent({ name: 'MultiSelect' })
    ms.vm.$emit('value-change', { value: ['a'] })
    await nextTick()

    expect(onValueChange).toHaveBeenCalled()
  })

  test('forwards show event', async () => {
    const onShow = vi.fn()
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'multi-select', onShow },
      }),
    })

    const ms = form.findComponent({ name: 'MultiSelect' })
    ms.vm.$emit('show')
    await nextTick()

    expect(onShow).toHaveBeenCalled()
  })

  test('forwards selectall-change event', async () => {
    const onSelectallChange = vi.fn()
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'multi-select', onSelectallChange },
      }),
    })

    const ms = form.findComponent({ name: 'MultiSelect' })
    ms.vm.$emit('selectall-change', { checked: true })
    await nextTick()

    expect(onSelectallChange).toHaveBeenCalled()
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
          const VfMultiSelect = resolveComponent('VfMultiSelect')
          return () =>
            h(
              VfForm,
              {},
              {
                default: () =>
                  h(
                    VfMultiSelect,
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
      const ms = wrapper.findComponent({ name: 'MultiSelect' })
      expect(ms.exists()).toBe(true)
    })
  })

  describe('option slot via prop', () => {
    test('renders custom option via defineSlot', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'multi-select',
            options: [{ value: 'a', label: 'A' }],
            slots: {
              option: defineSlot('VfMultiSelect.option', {
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

      const ms = form.findComponent({ name: 'MultiSelect' })
      expect(ms.exists()).toBe(true)
    })
  })
})
