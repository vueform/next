import { defineComponent, h, nextTick, resolveComponent } from 'vue'
import { createForm, mountApp } from '../../helpers'
import { defineSchema, defineSlot } from '#primevue'

// =============================================================================
// Basic rendering
// =============================================================================
describe('Basic rendering', () => {
  test('renders PrimeVue Listbox component', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'listbox' },
      }),
    })

    expect(form.findComponent({ name: 'Listbox' }).exists()).toBe(true)
  })

  test('renders with fluid prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'listbox' },
      }),
    })

    const lb = form.findComponent({ name: 'Listbox' })
    expect(lb.props('fluid')).toBe(true)
  })
})

// =============================================================================
// Model binding
// =============================================================================
describe('Model binding', () => {
  test('has null default value', () => {
    const { el } = createForm({
      schema: defineSchema({
        el: { type: 'listbox' },
      }),
    })

    expect(el.value).toBeNull()
  })

  test('renders with custom default value', () => {
    const { el } = createForm({
      schema: defineSchema({
        el: {
          type: 'listbox',
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

  test('updates value on change event', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: {
          type: 'listbox',
          options: [
            { value: 'a', label: 'A' },
            { value: 'b', label: 'B' },
          ],
        },
      }),
    })

    const lb = form.findComponent({ name: 'Listbox' })
    lb.vm.$emit('update:modelValue', 'b')
    await nextTick()

    expect(el.value).toBe('b')
  })
})

// =============================================================================
// Options
// =============================================================================
describe('Options', () => {
  test('passes options to Listbox', () => {
    const opts = [
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B' },
    ]

    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'listbox', options: opts },
      }),
    })

    const lb = form.findComponent({ name: 'Listbox' })
    expect(lb.props('options')).toHaveLength(2)
  })

  test('passes optionLabel and optionValue', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: {
          type: 'listbox',
          options: [{ code: 'us', name: 'United States' }],
          optionValue: 'code',
          optionLabel: 'name',
        },
      }),
    })

    const lb = form.findComponent({ name: 'Listbox' })
    expect(lb.props('optionLabel')).toBe('name')
    expect(lb.props('optionValue')).toBe('code')
  })

  test('passes optionGroupLabel and optionGroupChildren', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: {
          type: 'listbox',
          options: [
            {
              label: 'Group A',
              items: [{ value: 'a1', label: 'A1' }],
            },
          ],
          optionGroupLabel: 'label',
          optionGroupChildren: 'items',
        },
      }),
    })

    const lb = form.findComponent({ name: 'Listbox' })
    expect(lb.props('optionGroupLabel')).toBe('label')
    expect(lb.props('optionGroupChildren')).toBe('items')
  })
})

// =============================================================================
// Multiple mode
// =============================================================================
describe('Multiple mode', () => {
  test('defaults to single selection (multiple=false)', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'listbox' },
      }),
    })

    const lb = form.findComponent({ name: 'Listbox' })
    expect(lb.props('multiple')).toBe(false)
  })

  test('supports multiple selection', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: {
          type: 'listbox',
          options: [
            { value: 'a', label: 'A' },
            { value: 'b', label: 'B' },
          ],
          multiple: true,
        },
      }),
    })

    const lb = form.findComponent({ name: 'Listbox' })
    expect(lb.props('multiple')).toBe(true)

    lb.vm.$emit('update:modelValue', ['a', 'b'])
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
        el: { type: 'listbox', disabled: true },
      }),
    })

    const lb = form.findComponent({ name: 'Listbox' })
    expect(lb.props('disabled')).toBe(true)
  })

  test('is not disabled by default', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'listbox' },
      }),
    })

    const lb = form.findComponent({ name: 'Listbox' })
    expect(lb.props('disabled')).toBe(false)
  })
})

// =============================================================================
// Validation (invalid state)
// =============================================================================
describe('Validation', () => {
  test('passes invalid state to Listbox', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'listbox', rules: 'required' },
      }),
    })

    await el.validate()
    await nextTick()

    const lb = form.findComponent({ name: 'Listbox' })
    expect(lb.props('invalid')).toBe(true)
  })
})

// =============================================================================
// Interaction events
// =============================================================================
describe('Interaction events', () => {
  test('handles focus event', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'listbox' },
      }),
    })

    const lb = form.findComponent({ name: 'Listbox' })
    lb.vm.$emit('focus', new FocusEvent('focus'))
    await nextTick()

    expect(el.focused).toBe(true)
  })

  test('handles blur event', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'listbox' },
      }),
    })

    const lb = form.findComponent({ name: 'Listbox' })
    lb.vm.$emit('focus', new FocusEvent('focus'))
    await nextTick()
    lb.vm.$emit('blur', new FocusEvent('blur'))
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
        el: { type: 'listbox', onValueChange },
      }),
    })

    const lb = form.findComponent({ name: 'Listbox' })
    lb.vm.$emit('value-change', { value: 'a' })
    await nextTick()

    expect(onValueChange).toHaveBeenCalled()
  })

  test('forwards filter event', async () => {
    const onFilter = vi.fn()
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'listbox', onFilter },
      }),
    })

    const lb = form.findComponent({ name: 'Listbox' })
    lb.vm.$emit('filter', { value: 'search' })
    await nextTick()

    expect(onFilter).toHaveBeenCalled()
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
          const VfListbox = resolveComponent('VfListbox')
          return () =>
            h(
              VfForm,
              {},
              {
                default: () =>
                  h(
                    VfListbox,
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
      const lb = wrapper.findComponent({ name: 'Listbox' })
      expect(lb.exists()).toBe(true)
    })
  })

  describe('option slot via prop', () => {
    test('renders custom option via defineSlot', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'listbox',
            options: [{ value: 'a', label: 'A' }],
            slots: {
              option: defineSlot('VfListbox.option', {
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

      const lb = form.findComponent({ name: 'Listbox' })
      expect(lb.exists()).toBe(true)
    })
  })
})
