import { defineComponent, nextTick, ref } from 'vue'

import { defineSchema } from '#primevue'

import { createForm, mountApp } from '../../helpers'

// =============================================================================
// PLAIN ARRAY OPTIONS
// =============================================================================
describe('Plain array options', () => {
  it('should render checkboxes from a string array', () => {
    const { el } = createForm({
      schema: defineSchema({
        el: {
          type: 'checkbox-group',
          options: ['Foo', 'Bar', 'Baz'],
        },
      }),
    })

    expect(el.items).toHaveLength(3)
    expect(el.items[0]).toMatchObject({
      value: 'Foo',
      label: 'Foo',
      disabled: false,
      key: 0,
    })
    expect(el.items[1]).toMatchObject({
      value: 'Bar',
      label: 'Bar',
      disabled: false,
      key: 1,
    })
    expect(el.items[2]).toMatchObject({
      value: 'Baz',
      label: 'Baz',
      disabled: false,
      key: 2,
    })
  })

  it('should render checkboxes from a numeric array', () => {
    const { el } = createForm({
      schema: defineSchema({
        el: {
          type: 'checkbox-group',
          options: [10, 20, 30],
        },
      }),
    })

    expect(el.items).toHaveLength(3)
    expect(el.items[0]).toMatchObject({ value: 10, label: 10 })
    expect(el.items[2]).toMatchObject({ value: 30, label: 30 })
  })
})

// =============================================================================
// OBJECT OPTIONS
// =============================================================================
describe('Object options', () => {
  it('should render checkboxes from a key-value object', () => {
    const { el } = createForm({
      schema: defineSchema({
        el: {
          type: 'checkbox-group',
          options: { a: 'Apple', b: 'Banana', c: 'Cherry' },
        },
      }),
    })

    expect(el.items).toHaveLength(3)
    expect(el.items[0]).toMatchObject({ value: 'a', label: 'Apple' })
    expect(el.items[1]).toMatchObject({ value: 'b', label: 'Banana' })
    expect(el.items[2]).toMatchObject({ value: 'c', label: 'Cherry' })
  })
})

// =============================================================================
// ARRAY OF OBJECTS OPTIONS
// =============================================================================
describe('Array of objects options', () => {
  it('should render checkboxes from an array of objects with custom accessors', () => {
    const { el } = createForm({
      schema: defineSchema({
        el: {
          type: 'checkbox-group',
          options: [
            { id: 1, name: 'Red' },
            { id: 2, name: 'Green' },
            { id: 3, name: 'Blue' },
          ],
          optionValue: 'id',
          optionLabel: 'name',
        },
      }),
    })

    expect(el.items).toHaveLength(3)
    expect(el.items[0]).toMatchObject({ value: 1, label: 'Red' })
    expect(el.items[1]).toMatchObject({ value: 2, label: 'Green' })
    expect(el.items[2]).toMatchObject({ value: 3, label: 'Blue' })
  })
})

// =============================================================================
// MODEL BINDING
// =============================================================================
describe('Model binding', () => {
  it('should have an empty array as the initial model value', () => {
    const { form$, el } = createForm({
      schema: defineSchema({
        el: {
          type: 'checkbox-group',
          options: { a: 'A', b: 'B', c: 'C' },
        },
      }),
    })

    expect(form$.model).toEqual({ el: [] })
    expect(el.value).toEqual([])
  })

  it('should update the model when toggling checkboxes', async () => {
    const onChange = vi.fn()

    const { form$, form } = createForm({
      schema: defineSchema({
        el: {
          type: 'checkbox-group',
          options: { a: 'A', b: 'B', c: 'C' },
          onChange,
        },
      }),
    })

    const inputs = form.findAll('input[type="checkbox"]')
    expect(inputs.length).toBe(3)

    await inputs[0].setValue(true)
    await nextTick()

    expect(form$.model).toEqual({ el: ['a'] })
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0]).toEqual(['a'])
    expect(onChange.mock.calls[0][1]).toEqual([])

    await inputs[2].setValue(true)
    await nextTick()

    expect(form$.model).toEqual({ el: ['a', 'c'] })
    expect(onChange).toHaveBeenCalledTimes(2)

    await inputs[0].setValue(false)
    await nextTick()

    expect(form$.model).toEqual({ el: ['c'] })
    expect(onChange).toHaveBeenCalledTimes(3)
  })

  it('should load a default value', () => {
    const { form$, el } = createForm({
      schema: defineSchema({
        el: {
          type: 'checkbox-group',
          options: { a: 'A', b: 'B', c: 'C' },
          defaultValue: ['b', 'c'],
        },
      }),
    })

    expect(form$.model).toEqual({ el: ['b', 'c'] })
    expect(el.value).toEqual(['b', 'c'])
  })
})

// =============================================================================
// DISABLED
// =============================================================================
describe('Disabled', () => {
  it('should disable all checkboxes when the element is disabled', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: {
          type: 'checkbox-group',
          options: { a: 'A', b: 'B' },
          disabled: true,
        },
      }),
    })

    const inputs = form.findAll('input[type="checkbox"]')
    inputs.forEach((input) => {
      expect(input.attributes('disabled')).toBeDefined()
    })
  })
})

// =============================================================================
// STACKED
// =============================================================================
describe('Stacked', () => {
  it('should apply stacked class when stacked prop is true', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: {
          type: 'checkbox-group',
          options: { a: 'A', b: 'B' },
          stacked: true,
        },
      }),
    })

    const group = form.find('.vf-choices-group')
    expect(group.classes()).toContain('vf-stacked')
  })

  it('should not apply stacked class when stacked prop is false', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: {
          type: 'checkbox-group',
          options: { a: 'A', b: 'B' },
        },
      }),
    })

    const group = form.find('.vf-choices-group')
    expect(group.classes()).not.toContain('vf-stacked')
  })
})

// =============================================================================
// INLINE TEMPLATE
// =============================================================================
describe('Inline template', () => {
  it('should render checkboxes from inline template props', async () => {
    const App = defineComponent({
      template: `
        <VfForm ref="form$">
          <VfCheckboxGroup name="el" :options="['X', 'Y', 'Z']" />
        </VfForm>
      `,
      setup() {
        const form$ = ref()
        return { form$ }
      },
    })

    const app = mountApp(App)
    await nextTick()

    const el$ = app.vm.form$.find('el')
    expect(el$.items).toHaveLength(3)
    expect(el$.items[0].value).toBe('X')

    const inputs = app.findAll('input[type="checkbox"]')
    expect(inputs.length).toBe(3)
  })
})

// =============================================================================
// GROUPED OPTIONS
// =============================================================================
describe('Grouped options', () => {
  it('should render grouped checkboxes with fieldsets', () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: {
          type: 'checkbox-group',
          options: [
            {
              label: 'Fruits',
              items: [
                { value: 'apple', label: 'Apple' },
                { value: 'banana', label: 'Banana' },
              ],
            },
            {
              label: 'Vegetables',
              items: [
                { value: 'carrot', label: 'Carrot' },
                { value: 'potato', label: 'Potato' },
              ],
            },
          ],
          optionLabel: 'label',
          optionValue: 'value',
          optionGroupLabel: 'label',
          optionGroupChildren: 'items',
        },
      }),
    })

    expect(el.grouped).toBe(true)

    const fieldsets = form.findAll('fieldset')
    expect(fieldsets.length).toBe(2)

    const legends = form.findAll('legend')
    expect(legends[0].text()).toBe('Fruits')
    expect(legends[1].text()).toBe('Vegetables')

    const inputs = form.findAll('input[type="checkbox"]')
    expect(inputs.length).toBe(4)
  })
})
