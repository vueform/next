import { defineComponent, h, nextTick, resolveComponent } from 'vue'

import { defineSchema, defineSlot } from '#primevue'

import { createForm, mountApp } from '../../helpers'

const cascadeOptions = [
  {
    name: 'Electronics',
    code: 'electronics',
    items: [
      {
        name: 'Phones',
        code: 'phones',
        items: [
          { name: 'iPhone', code: 'iphone' },
          { name: 'Android', code: 'android' },
        ],
      },
    ],
  },
  {
    name: 'Clothing',
    code: 'clothing',
    items: [
      {
        name: 'Shirts',
        code: 'shirts',
        items: [
          { name: 'T-Shirt', code: 'tshirt' },
          { name: 'Polo', code: 'polo' },
        ],
      },
    ],
  },
]

// =============================================================================
// Basic rendering
// =============================================================================
describe('Basic rendering', () => {
  test('renders PrimeVue CascadeSelect component', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'cascade-select' },
      }),
    })

    expect(form.findComponent({ name: 'CascadeSelect' }).exists()).toBe(true)
  })

  test('renders with fluid prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'cascade-select' },
      }),
    })

    const cs = form.findComponent({ name: 'CascadeSelect' })
    expect(cs.props('fluid')).toBe(true)
  })
})

// =============================================================================
// Model binding
// =============================================================================
describe('Model binding', () => {
  test('has null default value', () => {
    const { el } = createForm({
      schema: defineSchema({
        el: { type: 'cascade-select' },
      }),
    })

    expect(el.value).toBeNull()
  })

  test('renders with custom default value', () => {
    const { el } = createForm({
      schema: defineSchema({
        el: {
          type: 'cascade-select',
          options: cascadeOptions,
          optionValue: 'code',
          optionLabel: 'name',
          optionGroupLabel: 'name',
          optionGroupChildren: ['items', 'items'],
          defaultValue: 'iphone',
        },
      }),
    })

    expect(el.value).toBe('iphone')
  })

  test('updates value on change event', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: {
          type: 'cascade-select',
          options: cascadeOptions,
          optionValue: 'code',
          optionLabel: 'name',
          optionGroupLabel: 'name',
          optionGroupChildren: ['items', 'items'],
        },
      }),
    })

    const cs = form.findComponent({ name: 'CascadeSelect' })
    cs.vm.$emit('update:modelValue', 'android')
    await nextTick()

    expect(el.value).toBe('android')
  })
})

// =============================================================================
// Options
// =============================================================================
describe('Options', () => {
  test('passes options to CascadeSelect', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: {
          type: 'cascade-select',
          options: cascadeOptions,
          optionValue: 'code',
          optionLabel: 'name',
          optionGroupLabel: 'name',
          optionGroupChildren: ['items', 'items'],
        },
      }),
    })

    const cs = form.findComponent({ name: 'CascadeSelect' })
    expect(cs.props('options')).toHaveLength(2)
  })

  test('passes optionLabel and optionValue', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: {
          type: 'cascade-select',
          options: cascadeOptions,
          optionValue: 'code',
          optionLabel: 'name',
          optionGroupLabel: 'name',
          optionGroupChildren: ['items', 'items'],
        },
      }),
    })

    const cs = form.findComponent({ name: 'CascadeSelect' })
    expect(cs.props('optionLabel')).toBe('name')
    expect(cs.props('optionValue')).toBe('code')
  })

  test('passes optionGroupLabel and optionGroupChildren', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: {
          type: 'cascade-select',
          options: cascadeOptions,
          optionValue: 'code',
          optionLabel: 'name',
          optionGroupLabel: 'name',
          optionGroupChildren: ['items', 'items'],
        },
      }),
    })

    const cs = form.findComponent({ name: 'CascadeSelect' })
    expect(cs.props('optionGroupLabel')).toBe('name')
    expect(cs.props('optionGroupChildren')).toEqual(['items', 'items'])
  })
})

// =============================================================================
// Props
// =============================================================================
describe('Props', () => {
  test('passes placeholder prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'cascade-select', placeholder: 'Select a category' },
      }),
    })

    const cs = form.findComponent({ name: 'CascadeSelect' })
    expect(cs.props('placeholder')).toBe('Select a category')
  })

  test('passes disabled prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'cascade-select', disabled: true },
      }),
    })

    const cs = form.findComponent({ name: 'CascadeSelect' })
    expect(cs.props('disabled')).toBe(true)
  })

  test('is not disabled by default', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'cascade-select' },
      }),
    })

    const cs = form.findComponent({ name: 'CascadeSelect' })
    expect(cs.props('disabled')).toBe(false)
  })

  test('passes loading prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'cascade-select', loading: true },
      }),
    })

    const cs = form.findComponent({ name: 'CascadeSelect' })
    expect(cs.props('loading')).toBe(true)
  })
})

// =============================================================================
// Validation (invalid state)
// =============================================================================
describe('Validation', () => {
  test('passes invalid state to CascadeSelect', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'cascade-select', rules: 'required' },
      }),
    })

    await el.validate()
    await nextTick()

    const cs = form.findComponent({ name: 'CascadeSelect' })
    expect(cs.props('invalid')).toBe(true)
  })
})

// =============================================================================
// Interaction events
// =============================================================================
describe('Interaction events', () => {
  test('handles focus event', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'cascade-select' },
      }),
    })

    const cs = form.findComponent({ name: 'CascadeSelect' })
    cs.vm.$emit('focus', new FocusEvent('focus'))
    await nextTick()

    expect(el.focused).toBe(true)
  })

  test('handles blur event', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'cascade-select' },
      }),
    })

    const cs = form.findComponent({ name: 'CascadeSelect' })
    cs.vm.$emit('focus', new FocusEvent('focus'))
    await nextTick()
    cs.vm.$emit('blur', new FocusEvent('blur'))
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
        el: { type: 'cascade-select', onValueChange },
      }),
    })

    const cs = form.findComponent({ name: 'CascadeSelect' })
    cs.vm.$emit('value-change', { value: 'iphone' })
    await nextTick()

    expect(onValueChange).toHaveBeenCalled()
  })

  test('forwards group-change event', async () => {
    const onGroupChange = vi.fn()
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'cascade-select', onGroupChange },
      }),
    })

    const cs = form.findComponent({ name: 'CascadeSelect' })
    cs.vm.$emit('group-change', { value: 'electronics' })
    await nextTick()

    expect(onGroupChange).toHaveBeenCalled()
  })

  test('forwards show event', async () => {
    const onShow = vi.fn()
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'cascade-select', onShow },
      }),
    })

    const cs = form.findComponent({ name: 'CascadeSelect' })
    cs.vm.$emit('show')
    await nextTick()

    expect(onShow).toHaveBeenCalled()
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
          const VfCascadeSelect = resolveComponent('VfCascadeSelect')
          return () =>
            h(
              VfForm,
              {},
              {
                default: () =>
                  h(
                    VfCascadeSelect,
                    {
                      name: 'el',
                      options: cascadeOptions,
                      optionValue: 'code',
                      optionLabel: 'name',
                      optionGroupLabel: 'name',
                      optionGroupChildren: ['items', 'items'],
                    },
                    {
                      option: (props: any) =>
                        h(
                          'span',
                          { class: 'custom-option' },
                          `Custom: ${props.option?.name ?? ''}`
                        ),
                    }
                  ),
              }
            )
        },
      })

      const wrapper = mountApp(App)
      const cs = wrapper.findComponent({ name: 'CascadeSelect' })
      expect(cs.exists()).toBe(true)
    })
  })

  describe('option slot via prop', () => {
    test('renders custom option via defineSlot', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'cascade-select',
            options: cascadeOptions,
            optionValue: 'code',
            optionLabel: 'name',
            optionGroupLabel: 'name',
            optionGroupChildren: ['items', 'items'],
            slots: {
              option: defineSlot('VfCascadeSelect.option', {
                props: ['option'],
                setup(props: any) {
                  return () =>
                    h(
                      'span',
                      { class: 'custom-option-slot' },
                      `Option: ${props.option?.name ?? ''}`
                    )
                },
              }),
            },
          },
        }),
      })

      const cs = form.findComponent({ name: 'CascadeSelect' })
      expect(cs.exists()).toBe(true)
    })
  })
})
