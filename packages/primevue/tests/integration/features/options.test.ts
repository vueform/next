import { defineSchema } from '@vueform/primevue'
import { defineComponent, nextTick, ref } from 'vue'

import { createForm, mountApp } from '../../helpers'

// =============================================================================
// PLAIN ARRAY OPTIONS
// =============================================================================
describe('Plain array options', () => {
  it('should render plain string array options via VfSelect', () => {
    const { select } = createForm({
      schema: defineSchema({
        select: {
          type: 'select',
          options: ['Foo', 'Bar', 'Baz'],
        },
      }),
    })

    const comp = select.input
    expect(comp).toBeTruthy()
    expect(select.rawItems).toHaveLength(3)
    expect(select.rawItems[0]).toEqual({ value: 'Foo', label: 'Foo' })
    expect(select.rawItems[1]).toEqual({ value: 'Bar', label: 'Bar' })
    expect(select.rawItems[2]).toEqual({ value: 'Baz', label: 'Baz' })
  })

  it('should render numeric array options via VfSelect', () => {
    const { select } = createForm({
      schema: defineSchema({
        select: {
          type: 'select',
          options: [10, 20, 30],
        },
      }),
    })

    expect(select.rawItems).toHaveLength(3)
    expect(select.rawItems[0]).toEqual({ value: 10, label: 10 })
    expect(select.rawItems[2]).toEqual({ value: 30, label: 30 })
  })

  it('should render plain string array options via VfMultiSelect', () => {
    const { ms } = createForm({
      schema: defineSchema({
        ms: {
          type: 'multi-select',
          options: ['Foo', 'Bar', 'Baz'],
        },
      }),
    })

    expect(ms.rawItems).toHaveLength(3)
    expect(ms.rawItems[0]).toEqual({ value: 'Foo', label: 'Foo' })
  })
})

// =============================================================================
// INLINE TEMPLATE REACTIVITY
// =============================================================================
describe('Inline template reactivity', () => {
  it('should not re-resolve inline array options when another prop changes', async () => {
    let resolveCount = 0

    const App = defineComponent({
      template: `
        <VfForm ref="form$">
          <VfSelect name="select" :options="optionsFn" :label="label" />
        </VfForm>
      `,
      setup() {
        const form$ = ref()
        const label = ref('Pick one')
        const optionsFn = () => {
          resolveCount++
          return ['Foo', 'Bar', 'Baz']
        }
        return { form$, label, optionsFn }
      },
    })

    const app = mountApp(App)
    await nextTick()

    expect(resolveCount).toBe(1)

    const el$ = app.vm.form$.find('select')
    expect(el$.items).toHaveLength(3)

    app.vm.label = 'Choose'
    await nextTick()

    expect(resolveCount).toBe(1)
    expect(el$.items).toHaveLength(3)
  })

  it('should not re-resolve inline trigger array when another prop changes', async () => {
    let resolveCount = 0

    const App = defineComponent({
      template: `
        <VfForm ref="form$">
          <VfSelect name="country" type="text" :default-value="'us'" />
          <VfSelect name="select" :options="optionsFn" :options-trigger="['country']" :options-debounce="0" :label="label" />
        </VfForm>
      `,
      setup() {
        const form$ = ref()
        const label = ref('Pick')
        const optionsFn = () => {
          resolveCount++
          return ['A', 'B']
        }
        return { form$, label, optionsFn }
      },
    })

    const app = mountApp(App)
    await nextTick()

    expect(resolveCount).toBe(1)

    app.vm.form$.find('country').update('uk')
    await nextTick()

    expect(resolveCount).toBe(2)

    app.vm.label = 'Choose'
    await nextTick()

    expect(resolveCount).toBe(2)
  })
})

// =============================================================================
// PLAIN OBJECT OPTIONS
// =============================================================================
describe('Plain object options', () => {
  it('should render object options with keys as values and values as labels', () => {
    const { select } = createForm({
      schema: defineSchema({
        select: {
          type: 'select',
          options: { foo: 'Foo', bar: 'Bar', baz: 'Baz' },
        },
      }),
    })

    expect(select.rawItems).toHaveLength(3)
    expect(select.rawItems[0]).toEqual({ value: 'foo', label: 'Foo' })
    expect(select.rawItems[1]).toEqual({ value: 'bar', label: 'Bar' })
    expect(select.rawItems[2]).toEqual({ value: 'baz', label: 'Baz' })
  })
})

// =============================================================================
// ARRAY OF OBJECTS OPTIONS
// =============================================================================
describe('Array of objects options', () => {
  it('should render array of objects with optionValue and optionLabel', () => {
    const { select } = createForm({
      schema: defineSchema({
        select: {
          type: 'select',
          options: [
            { id: 1, name: 'Apple' },
            { id: 2, name: 'Banana' },
          ],
          optionValue: 'id',
          optionLabel: 'name',
        },
      }),
    })

    expect(select.rawItems).toHaveLength(2)
    expect(select.rawItems[0]).toEqual({ id: 1, name: 'Apple' })
    expect(select.rawItems[1]).toEqual({ id: 2, name: 'Banana' })
  })
})

// =============================================================================
// itemValue
// =============================================================================
describe('itemValue', () => {
  it('should use optionValue string to select the correct value', () => {
    const { select } = createForm({
      schema: defineSchema({
        select: {
          type: 'select',
          defaultValue: 'us',
          options: [
            { code: 'us', name: 'United States' },
            { code: 'uk', name: 'United Kingdom' },
          ],
          optionValue: 'code',
          optionLabel: 'name',
        },
      }),
    })

    expect(select.model).toBe('us')
    expect(select.itemValue).toBe('code')
  })

  it('should use value key for synthetic (plain array) items', () => {
    const { select } = createForm({
      schema: defineSchema({
        select: {
          type: 'select',
          options: ['Foo', 'Bar'],
        },
      }),
    })

    expect(select.itemValue).toBe('value')
  })
})

// =============================================================================
// optionLabel
// =============================================================================
describe('optionLabel', () => {
  it('should use optionLabel string to display the correct label', () => {
    const { select } = createForm({
      schema: defineSchema({
        select: {
          type: 'select',
          options: [
            { id: 1, title: 'First' },
            { id: 2, title: 'Second' },
          ],
          optionValue: 'id',
          optionLabel: 'title',
        },
      }),
    })

    expect(select.itemLabel).toBe('title')
  })

  it('should use label key for synthetic (plain array) items', () => {
    const { select } = createForm({
      schema: defineSchema({
        select: {
          type: 'select',
          options: ['Foo', 'Bar'],
        },
      }),
    })

    expect(select.itemLabel).toBe('label')
  })
})

// =============================================================================
// optionGroupLabel / optionGroupChildren
// =============================================================================
describe('optionGroupLabel and optionGroupChildren', () => {
  it('should render grouped options with string props', () => {
    const { select } = createForm({
      schema: defineSchema({
        select: {
          type: 'select',
          options: [
            {
              category: 'Fruits',
              items: [
                { id: 1, name: 'Apple' },
                { id: 2, name: 'Banana' },
              ],
            },
            {
              category: 'Vegetables',
              items: [{ id: 3, name: 'Carrot' }],
            },
          ],
          optionValue: 'id',
          optionLabel: 'name',
          optionGroupLabel: 'category',
          optionGroupChildren: 'items',
        },
      }),
    })

    expect(select.grouped).toBe(true)
    expect(select.rawItems).toHaveLength(2)
    expect(select.rawItems[0].category).toBe('Fruits')
    expect(select.rawItems[0].items).toHaveLength(2)
    expect(select.rawItems[1].category).toBe('Vegetables')
    expect(select.groups).toHaveLength(2)
    expect(select.groups[0].label).toBe('Fruits')
    expect(select.groups[0].items).toHaveLength(2)
  })

  it('should render grouped options with function groupLabel', () => {
    const { select } = createForm({
      schema: defineSchema({
        select: {
          type: 'select',
          options: [
            { cat: 'fruit', items: ['Apple'] },
            { cat: 'veggie', items: ['Carrot'] },
          ],
          optionGroupLabel: (group) => group.cat.toUpperCase(),
          optionGroupChildren: 'items',
        },
      }),
    })

    expect(select.grouped).toBe(true)
  })
})

// =============================================================================
// optionDisabled WITH CONDITIONAL PROP
// =============================================================================
describe('optionDisabled with ConditionalProp', () => {
  describe('plain array', () => {
    it('should disable items via structured condition on plain string array', () => {
      const { trigger, select } = createForm({
        schema: defineSchema({
          trigger: { type: 'input-text', defaultValue: 'Foo' },
          select: {
            type: 'select',
            options: ['Foo', 'Bar', 'Baz'],
            optionDisabled: (item) => [['trigger', '==', item.value ?? item]],
          },
        }),
      })

      const disabled = select.rawItems.map((o: any) => o.__disabled)
      expect(disabled[0]).toBe(true)
      expect(disabled[1]).toBe(false)
      expect(disabled[2]).toBe(false)
      expect(select.itemDisabled).toBe('__disabled')

      trigger.update('Bar')
      const disabled2 = select.rawItems.map((o: any) => o.__disabled)
      expect(disabled2[0]).toBe(false)
      expect(disabled2[1]).toBe(true)
    })
  })

  describe('plain object', () => {
    it('should disable items via structured condition on plain object', () => {
      const { select } = createForm({
        schema: defineSchema({
          trigger: { type: 'input-text', defaultValue: 'foo' },
          select: {
            type: 'select',
            options: { foo: 'Foo', bar: 'Bar' },
            optionDisabled: (item) => [['trigger', '==', item.value ?? item]],
          },
        }),
      })

      const disabled = select.rawItems.map((o: any) => o.__disabled)
      expect(disabled[0]).toBe(true)
      expect(disabled[1]).toBe(false)
      expect(select.itemDisabled).toBe('__disabled')
    })
  })

  describe('array of objects', () => {
    it('should disable items via structured condition on array of objects', () => {
      const { trigger, select } = createForm({
        schema: defineSchema({
          trigger: { type: 'input-text', defaultValue: 'a' },
          select: {
            type: 'select',
            options: [
              { id: 'a', name: 'Alpha' },
              { id: 'b', name: 'Beta' },
            ],
            optionValue: 'id',
            optionLabel: 'name',
            optionDisabled: (item) => [['trigger', '==', item.id]],
          },
        }),
      })

      expect(select.rawItems[0].__disabled).toBe(true)
      expect(select.rawItems[1].__disabled).toBe(false)
      expect(select.itemDisabled).toBe('__disabled')

      trigger.update('b')
      expect(select.rawItems[0].__disabled).toBe(false)
      expect(select.rawItems[1].__disabled).toBe(true)
    })

    it('should disable items via expression condition string on array of objects', () => {
      const { select } = createForm({
        schema: defineSchema({
          trigger: { type: 'input-text', defaultValue: 'a' },
          select: {
            type: 'select',
            options: [
              { id: 'a', name: 'Alpha' },
              { id: 'b', name: 'Beta' },
            ],
            optionValue: 'id',
            optionLabel: 'name',
            optionDisabled: (item) => `trigger == "${item.id}"`,
          },
        }),
      })

      expect(select.rawItems[0].__disabled).toBe(true)
      expect(select.rawItems[1].__disabled).toBe(false)
      expect(select.itemDisabled).toBe('__disabled')
    })
  })

  it('should fall back to original prop when optionDisabled returns a boolean', () => {
    const { select } = createForm({
      schema: defineSchema({
        select: {
          type: 'select',
          options: [
            { id: 'a', name: 'A', off: true },
            { id: 'b', name: 'B', off: false },
          ],
          optionValue: 'id',
          optionLabel: 'name',
          optionDisabled: (item) => item.off,
        },
      }),
    })

    expect(typeof select.itemDisabled).toBe('function')
    expect(select.itemDisabled).not.toBe('__disabled')
  })

  it('should fall back to original prop when optionDisabled is a string key', () => {
    const { select } = createForm({
      schema: defineSchema({
        select: {
          type: 'select',
          options: [
            { id: 'a', name: 'A', inactive: true },
            { id: 'b', name: 'B', inactive: false },
          ],
          optionValue: 'id',
          optionLabel: 'name',
          optionDisabled: 'inactive',
        },
      }),
    })

    expect(select.itemDisabled).toBe('inactive')
  })
})

// =============================================================================
// optionConditions
// =============================================================================
describe('optionConditions', () => {
  it('should hide items whose conditions are not met', () => {
    const { trigger, select } = createForm({
      schema: defineSchema({
        trigger: { type: 'input-text', defaultValue: 'show_a' },
        select: {
          type: 'select',
          options: [
            { id: 'a', name: 'Alpha', showWhen: 'show_a' },
            { id: 'b', name: 'Beta', showWhen: 'show_b' },
          ],
          optionValue: 'id',
          optionLabel: 'name',
          optionConditions: (item) => [['trigger', '==', item.showWhen]],
        },
      }),
    })

    expect(select.rawItems).toHaveLength(1)
    expect(select.rawItems[0].id).toBe('a')

    trigger.update('show_b')
    expect(select.rawItems).toHaveLength(1)
    expect(select.rawItems[0].id).toBe('b')
  })

  it('should clear value when selected option becomes unavailable', async () => {
    const { trigger, select } = createForm({
      schema: defineSchema({
        trigger: { type: 'input-text', defaultValue: 'show_all' },
        select: {
          type: 'select',
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

    expect(select.model).toBe('a')

    trigger.update('hide')
    await nextTick()

    expect(select.rawItems).toHaveLength(0)
    expect(select.model).toBeNull()
  })
})

// =============================================================================
// MULTIPLE MODE
// =============================================================================
describe('Multiple mode (VfMultiSelect)', () => {
  it('should select and display multiple values from plain array', () => {
    const { ms } = createForm({
      schema: defineSchema({
        ms: {
          type: 'multi-select',
          defaultValue: ['Foo', 'Bar'],
          options: ['Foo', 'Bar', 'Baz'],
        },
      }),
    })

    expect(ms.model).toEqual(['Foo', 'Bar'])
    expect(ms.items).toHaveLength(3)
  })

  it('should select and display multiple values from object', () => {
    const { ms } = createForm({
      schema: defineSchema({
        ms: {
          type: 'multi-select',
          defaultValue: ['foo', 'baz'],
          options: { foo: 'Foo', bar: 'Bar', baz: 'Baz' },
        },
      }),
    })

    expect(ms.model).toEqual(['foo', 'baz'])
  })

  it('should select and display multiple values from array of objects', () => {
    const { ms } = createForm({
      schema: defineSchema({
        ms: {
          type: 'multi-select',
          defaultValue: [1, 3],
          options: [
            { id: 1, name: 'Foo' },
            { id: 2, name: 'Bar' },
            { id: 3, name: 'Baz' },
          ],
          optionValue: 'id',
          optionLabel: 'name',
        },
      }),
    })

    expect(ms.model).toEqual([1, 3])
  })

  it('should remove unavailable values when conditions become unmet in multi-select', async () => {
    const { trigger, ms } = createForm({
      schema: defineSchema({
        trigger: { type: 'input-text', defaultValue: 'show_all' },
        ms: {
          type: 'multi-select',
          defaultValue: ['a', 'b', 'c'],
          options: [
            { id: 'a', name: 'A', group: 'x' },
            { id: 'b', name: 'B', group: 'y' },
            { id: 'c', name: 'C', group: 'x' },
          ],
          optionValue: 'id',
          optionLabel: 'name',
          optionConditions: (item) => [
            [
              ['trigger', '==', 'show_all'],
              ['trigger', '==', item.group],
            ],
          ],
        },
      }),
    })

    expect(ms.model).toEqual(['a', 'b', 'c'])

    trigger.update('x')
    await nextTick()

    expect(ms.rawItems.map((o: any) => o.id)).toEqual(['a', 'c'])
    expect(ms.model).toEqual(['a', 'c'])
  })
})
