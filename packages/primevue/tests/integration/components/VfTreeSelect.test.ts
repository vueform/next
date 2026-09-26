import { defineComponent, h, nextTick, resolveComponent } from 'vue'
import { createForm, mountApp } from '../../helpers'
import { defineSchema, defineSlot } from '#primevue'

// =============================================================================
// Basic rendering
// =============================================================================
describe('Basic rendering', () => {
  test('renders PrimeVue TreeSelect component', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'tree-select' },
      }),
    })

    expect(form.findComponent({ name: 'TreeSelect' }).exists()).toBe(true)
  })

  test('renders with fluid prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'tree-select' },
      }),
    })

    const ts = form.findComponent({ name: 'TreeSelect' })
    expect(ts.props('fluid')).toBe(true)
  })
})

// =============================================================================
// Model binding
// =============================================================================
describe('Model binding', () => {
  test('has empty object default value', () => {
    const { el } = createForm({
      schema: defineSchema({
        el: { type: 'tree-select' },
      }),
    })

    expect(el.value).toEqual({})
  })

  test('renders with custom default value', () => {
    const { el } = createForm({
      schema: defineSchema({
        el: {
          type: 'tree-select',
          options: [
            { key: 'a', label: 'A' },
            { key: 'b', label: 'B' },
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
          type: 'tree-select',
          options: [
            { key: 'a', label: 'A' },
            { key: 'b', label: 'B' },
          ],
        },
      }),
    })

    const ts = form.findComponent({ name: 'TreeSelect' })
    ts.vm.$emit('update:modelValue', 'b')
    await nextTick()

    expect(el.value).toBe('b')
  })
})

// =============================================================================
// Options
// =============================================================================
describe('Options', () => {
  test('passes tree options to TreeSelect', () => {
    const nodes = [
      {
        key: 'parent',
        label: 'Parent',
        children: [
          { key: 'child1', label: 'Child 1' },
          { key: 'child2', label: 'Child 2' },
        ],
      },
    ]

    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'tree-select', options: nodes },
      }),
    })

    const ts = form.findComponent({ name: 'TreeSelect' })
    expect(ts.props('options')).toHaveLength(1)
  })
})

// =============================================================================
// Props
// =============================================================================
describe('Props', () => {
  test('passes placeholder prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'tree-select', placeholder: 'Select a node' },
      }),
    })

    const ts = form.findComponent({ name: 'TreeSelect' })
    expect(ts.props('placeholder')).toBe('Select a node')
  })

  test('passes disabled prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'tree-select', disabled: true },
      }),
    })

    const ts = form.findComponent({ name: 'TreeSelect' })
    expect(ts.props('disabled')).toBe(true)
  })

  test('is not disabled by default', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'tree-select' },
      }),
    })

    const ts = form.findComponent({ name: 'TreeSelect' })
    expect(ts.props('disabled')).toBe(false)
  })

  test('passes loading prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'tree-select', loading: true },
      }),
    })

    const ts = form.findComponent({ name: 'TreeSelect' })
    expect(ts.props('loading')).toBe(true)
  })
})

// =============================================================================
// Validation (invalid state)
// =============================================================================
describe('Validation', () => {
  test('is not invalid by default', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'tree-select' },
      }),
    })

    const ts = form.findComponent({ name: 'TreeSelect' })
    expect(ts.props('invalid')).toBe(false)
  })

  test('passes invalid prop to TreeSelect', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'tree-select', rules: 'required' },
      }),
    })

    const ts = form.findComponent({ name: 'TreeSelect' })
    expect(ts.props('invalid')).toBe(false)
  })
})

// =============================================================================
// Interaction events
// =============================================================================
describe('Interaction events', () => {
  test('handles focus event', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'tree-select' },
      }),
    })

    const ts = form.findComponent({ name: 'TreeSelect' })
    ts.vm.$emit('focus', new FocusEvent('focus'))
    await nextTick()

    expect(el.focused).toBe(true)
  })

  test('handles blur event', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'tree-select' },
      }),
    })

    const ts = form.findComponent({ name: 'TreeSelect' })
    ts.vm.$emit('focus', new FocusEvent('focus'))
    await nextTick()
    ts.vm.$emit('blur', new FocusEvent('blur'))
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
        el: { type: 'tree-select', onValueChange },
      }),
    })

    const ts = form.findComponent({ name: 'TreeSelect' })
    ts.vm.$emit('value-change', { value: 'a' })
    await nextTick()

    expect(onValueChange).toHaveBeenCalled()
  })

  test('forwards show event', async () => {
    const onShow = vi.fn()
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'tree-select', onShow },
      }),
    })

    const ts = form.findComponent({ name: 'TreeSelect' })
    ts.vm.$emit('show')
    await nextTick()

    expect(onShow).toHaveBeenCalled()
  })

  test('forwards node-select event', async () => {
    const onNodeSelect = vi.fn()
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'tree-select', onNodeSelect },
      }),
    })

    const ts = form.findComponent({ name: 'TreeSelect' })
    ts.vm.$emit('node-select', { key: 'a', label: 'A' })
    await nextTick()

    expect(onNodeSelect).toHaveBeenCalled()
  })

  test('forwards node-expand event', async () => {
    const onNodeExpand = vi.fn()
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'tree-select', onNodeExpand },
      }),
    })

    const ts = form.findComponent({ name: 'TreeSelect' })
    ts.vm.$emit('node-expand', { key: 'a', label: 'A' })
    await nextTick()

    expect(onNodeExpand).toHaveBeenCalled()
  })
})

// =============================================================================
// Forwarded slots
// =============================================================================
describe('Forwarded slots', () => {
  describe('value slot via inline', () => {
    test('renders custom value slot', () => {
      const App = defineComponent({
        setup() {
          const VfForm = resolveComponent('VfForm')
          const VfTreeSelect = resolveComponent('VfTreeSelect')
          return () =>
            h(
              VfForm,
              {},
              {
                default: () =>
                  h(
                    VfTreeSelect,
                    {
                      name: 'el',
                      options: [{ key: 'a', label: 'A' }],
                    },
                    {
                      value: () =>
                        h('span', { class: 'custom-value' }, 'Custom value'),
                    }
                  ),
              }
            )
        },
      })

      const wrapper = mountApp(App)
      const ts = wrapper.findComponent({ name: 'TreeSelect' })
      expect(ts.exists()).toBe(true)
    })
  })

  describe('value slot via prop', () => {
    test('renders custom value via defineSlot', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'tree-select',
            options: [{ key: 'a', label: 'A' }],
            slots: {
              value: defineSlot('VfTreeSelect.value', {
                props: ['value', 'placeholder'],
                setup(props: any) {
                  return () =>
                    h(
                      'span',
                      { class: 'custom-value-slot' },
                      `Val: ${props.value ?? props.placeholder}`
                    )
                },
              }),
            },
          },
        }),
      })

      const ts = form.findComponent({ name: 'TreeSelect' })
      expect(ts.exists()).toBe(true)
    })
  })
})
