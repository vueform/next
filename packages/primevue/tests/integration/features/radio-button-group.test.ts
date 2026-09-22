import { defineSchema } from '@vueform/primevue'
import { defineComponent, nextTick, ref } from 'vue'
import { createForm, mountApp } from '../../helpers'

// =============================================================================
// PLAIN ARRAY OPTIONS
// =============================================================================
describe('Plain array options', () => {
  it('should render radio buttons from a string array', () => {
    const { el } = createForm({
      schema: defineSchema({
        el: {
          type: 'radio-button-group',
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

  it('should render radio buttons from a numeric array', () => {
    const { el } = createForm({
      schema: defineSchema({
        el: {
          type: 'radio-button-group',
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
  it('should render radio buttons from a key-value object', () => {
    const { el } = createForm({
      schema: defineSchema({
        el: {
          type: 'radio-button-group',
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
  it('should render radio buttons from an array of objects with custom accessors', () => {
    const { el } = createForm({
      schema: defineSchema({
        el: {
          type: 'radio-button-group',
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
  it('should have null as the initial model value', () => {
    const { form$, el } = createForm({
      schema: defineSchema({
        el: {
          type: 'radio-button-group',
          options: { a: 'A', b: 'B', c: 'C' },
        },
      }),
    })

    expect(form$.model).toEqual({ el: null })
    expect(el.value).toBeNull()
  })

  it('should update the model when selecting a radio button', async () => {
    const onChange = vi.fn()

    const { form$, form } = createForm({
      schema: defineSchema({
        el: {
          type: 'radio-button-group',
          options: { a: 'A', b: 'B', c: 'C' },
          onChange,
        },
      }),
    })

    const inputs = form.findAll('input[type="radio"]')
    expect(inputs.length).toBe(3)

    await inputs[0].setValue(true)
    await nextTick()

    expect(form$.model).toEqual({ el: 'a' })
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0]).toBe('a')
    expect(onChange.mock.calls[0][1]).toBeNull()

    await inputs[2].setValue(true)
    await nextTick()

    expect(form$.model).toEqual({ el: 'c' })
    expect(onChange).toHaveBeenCalledTimes(2)
  })

  it('should load a default value', () => {
    const { form$, el } = createForm({
      schema: defineSchema({
        el: {
          type: 'radio-button-group',
          options: { a: 'A', b: 'B', c: 'C' },
          defaultValue: 'b',
        },
      }),
    })

    expect(form$.model).toEqual({ el: 'b' })
    expect(el.value).toBe('b')
  })
})

// =============================================================================
// DISABLED
// =============================================================================
describe('Disabled', () => {
  it('should disable all radio buttons when the element is disabled', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: {
          type: 'radio-button-group',
          options: { a: 'A', b: 'B' },
          disabled: true,
        },
      }),
    })

    const inputs = form.findAll('input[type="radio"]')
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
          type: 'radio-button-group',
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
          type: 'radio-button-group',
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
  it('should render radio buttons from inline template props', async () => {
    const App = defineComponent({
      template: `
        <VfForm ref="form$">
          <VfRadioButtonGroup name="el" :options="['X', 'Y', 'Z']" />
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

    const inputs = app.findAll('input[type="radio"]')
    expect(inputs.length).toBe(3)
  })
})

// =============================================================================
// GROUPED OPTIONS
// =============================================================================
describe('Grouped options', () => {
  it('should render grouped radio buttons with fieldsets', () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: {
          type: 'radio-button-group',
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

    const inputs = form.findAll('input[type="radio"]')
    expect(inputs.length).toBe(4)
  })
})

// =============================================================================
// OPTION DISABLED
// =============================================================================
describe('Option disabled', () => {
  it('should disable individual options via optionDisabled with conditional prop', () => {
    const { trigger, el } = createForm({
      schema: defineSchema({
        trigger: { type: 'input-text', defaultValue: 'a' },
        el: {
          type: 'radio-button-group',
          options: [
            { id: 'a', name: 'A' },
            { id: 'b', name: 'B' },
          ],
          optionValue: 'id',
          optionLabel: 'name',
          optionDisabled: (item: any) => [['trigger', '==', item.id]],
        },
      }),
    })

    expect(el.items[0].disabled).toBe(true)
    expect(el.items[1].disabled).toBe(false)

    trigger.update('b')
    expect(el.items[0].disabled).toBe(false)
    expect(el.items[1].disabled).toBe(true)
  })
})

// =============================================================================
// OPTION CONDITIONS
// =============================================================================
describe('Option conditions', () => {
  it('should hide options whose conditions are not met', () => {
    const { trigger, el } = createForm({
      schema: defineSchema({
        trigger: { type: 'input-text', defaultValue: 'show_a' },
        el: {
          type: 'radio-button-group',
          options: [
            { id: 'a', name: 'Alpha', showWhen: 'show_a' },
            { id: 'b', name: 'Beta', showWhen: 'show_b' },
          ],
          optionValue: 'id',
          optionLabel: 'name',
          optionConditions: (item: any) => [['trigger', '==', item.showWhen]],
        },
      }),
    })

    expect(el.items).toHaveLength(1)
    expect(el.items[0].value).toBe('a')

    trigger.update('show_b')
    expect(el.items).toHaveLength(1)
    expect(el.items[0].value).toBe('b')
  })

  it('should clear value when selected option becomes unavailable', async () => {
    const { trigger, el } = createForm({
      schema: defineSchema({
        trigger: { type: 'input-text', defaultValue: 'show_all' },
        el: {
          type: 'radio-button-group',
          defaultValue: 'a',
          options: [
            { id: 'a', name: 'Alpha' },
            { id: 'b', name: 'Beta' },
          ],
          optionValue: 'id',
          optionLabel: 'name',
          optionConditions: () => [['trigger', '==', 'show_all']],
        },
      }),
    })

    expect(el.model).toBe('a')

    trigger.update('hide')
    await nextTick()

    expect(el.items).toHaveLength(0)
    expect(el.model).toBeNull()
  })
})
