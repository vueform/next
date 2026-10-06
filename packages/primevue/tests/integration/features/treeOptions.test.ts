import { nextTick, ref } from 'vue'

import { defineSchema } from '#primevue'

import { createForm, flushPromises } from '../../helpers'

// =============================================================================
// RENDERING TREE ITEMS
// =============================================================================
describe('Rendering tree items', () => {
  it('should render a flat list of tree nodes', () => {
    const { tree } = createForm({
      schema: defineSchema({
        tree: {
          type: 'tree-select',
          options: [
            { key: 'a', label: 'Alpha' },
            { key: 'b', label: 'Beta' },
            { key: 'c', label: 'Gamma' },
          ],
        },
      }),
    })

    expect(tree.items).toHaveLength(3)
    expect(tree.items[0].key).toBe('a')
    expect(tree.items[0].label).toBe('Alpha')
    expect(tree.items[1].key).toBe('b')
    expect(tree.items[2].key).toBe('c')
  })

  it('should render nested tree nodes with children', () => {
    const { tree } = createForm({
      schema: defineSchema({
        tree: {
          type: 'tree-select',
          options: [
            {
              key: 'fruits',
              label: 'Fruits',
              children: [
                { key: 'apple', label: 'Apple' },
                { key: 'banana', label: 'Banana' },
              ],
            },
            {
              key: 'veggies',
              label: 'Vegetables',
              children: [{ key: 'carrot', label: 'Carrot' }],
            },
          ],
        },
      }),
    })

    expect(tree.items).toHaveLength(2)
    expect(tree.items[0].children).toHaveLength(2)
    expect(tree.items[0].children[0].key).toBe('apple')
    expect(tree.items[1].children).toHaveLength(1)
    expect(tree.items[1].children[0].key).toBe('carrot')
  })

  it('should strip conditions property from output nodes', () => {
    const { tree } = createForm({
      schema: defineSchema({
        tree: {
          type: 'tree-select',
          options: [
            { key: 'a', label: 'Alpha', conditions: true },
            { key: 'b', label: 'Beta' },
          ],
        },
      }),
    })

    expect(tree.items[0].conditions).toBeUndefined()
    expect(tree.items[0].key).toBe('a')
  })
})

// =============================================================================
// SELECTION - SINGLE (checkbox)
// =============================================================================
describe('Selection - single (default)', () => {
  it('should select a single leaf node', () => {
    const { tree } = createForm({
      schema: defineSchema({
        tree: {
          type: 'tree-select',
          defaultValue: { apple: true },
          options: [
            {
              key: 'fruits',
              label: 'Fruits',
              children: [
                { key: 'apple', label: 'Apple' },
                { key: 'banana', label: 'Banana' },
              ],
            },
          ],
        },
      }),
    })

    expect(tree.model).toEqual({ apple: true })
  })

  it('should update model when selecting a different node', async () => {
    const { tree } = createForm({
      schema: defineSchema({
        tree: {
          type: 'tree-select',
          options: [
            { key: 'a', label: 'Alpha' },
            { key: 'b', label: 'Beta' },
          ],
        },
      }),
    })

    tree.update({ a: true })
    await nextTick()

    expect(tree.model).toEqual({ a: true })

    tree.update({ b: true })
    await nextTick()

    expect(tree.model).toEqual({ b: true })
  })
})

// =============================================================================
// SELECTION - selectionMode="single"
// =============================================================================
describe('Selection - selectionMode="single"', () => {
  it('should select a single key as the model value', () => {
    const { tree } = createForm({
      schema: defineSchema({
        tree: {
          type: 'tree-select',
          selectionMode: 'single',
          defaultValue: 'apple',
          options: [
            {
              key: 'fruits',
              label: 'Fruits',
              children: [
                { key: 'apple', label: 'Apple' },
                { key: 'banana', label: 'Banana' },
              ],
            },
          ],
        },
      }),
    })

    expect(tree.model).toBe('apple')
  })
})

// =============================================================================
// SELECTION - selectionMode="checkbox"
// =============================================================================
describe('Selection - selectionMode="checkbox"', () => {
  it('should select multiple items via checkbox mode', () => {
    const { tree } = createForm({
      schema: defineSchema({
        tree: {
          type: 'tree-select',
          selectionMode: 'checkbox',
          defaultValue: { apple: true, carrot: true },
          options: [
            {
              key: 'fruits',
              label: 'Fruits',
              children: [
                { key: 'apple', label: 'Apple' },
                { key: 'banana', label: 'Banana' },
              ],
            },
            {
              key: 'veggies',
              label: 'Vegetables',
              children: [{ key: 'carrot', label: 'Carrot' }],
            },
          ],
        },
      }),
    })

    expect(tree.model).toEqual({ apple: true, carrot: true })
  })

  it('should update model when toggling checkboxes', async () => {
    const { tree } = createForm({
      schema: defineSchema({
        tree: {
          type: 'tree-select',
          selectionMode: 'checkbox',
          defaultValue: { apple: true },
          options: [
            {
              key: 'fruits',
              label: 'Fruits',
              children: [
                { key: 'apple', label: 'Apple' },
                { key: 'banana', label: 'Banana' },
              ],
            },
          ],
        },
      }),
    })

    expect(tree.model).toEqual({ apple: true })

    tree.update({ apple: true, banana: true })
    await nextTick()

    expect(tree.model).toEqual({ apple: true, banana: true })
  })
})

// =============================================================================
// CONDITIONS - EXPRESSION STRING
// =============================================================================
describe('Conditions - expression string', () => {
  it('should hide nodes whose expression condition is unmet', () => {
    const { trigger, tree } = createForm({
      schema: defineSchema({
        trigger: { type: 'input-text', defaultValue: 'yes' },
        tree: {
          type: 'tree-select',
          options: [
            { key: 'a', label: 'Alpha', conditions: 'trigger == "yes"' },
            { key: 'b', label: 'Beta' },
          ],
        },
      }),
    })

    expect(tree.items).toHaveLength(2)
    expect(tree.items[0].key).toBe('a')

    trigger.update('no')
    expect(tree.items).toHaveLength(1)
    expect(tree.items[0].key).toBe('b')
  })
})

// =============================================================================
// CONDITIONS - STRUCTURED
// =============================================================================
describe('Conditions - structured', () => {
  it('should hide nodes whose structured condition is unmet', () => {
    const { trigger, tree } = createForm({
      schema: defineSchema({
        trigger: { type: 'input-text', defaultValue: 'show_a' },
        tree: {
          type: 'tree-select',
          options: [
            {
              key: 'a',
              label: 'Alpha',
              conditions: [['trigger', '==', 'show_a']],
            },
            {
              key: 'b',
              label: 'Beta',
              conditions: [['trigger', '==', 'show_b']],
            },
          ],
        },
      }),
    })

    expect(tree.items).toHaveLength(1)
    expect(tree.items[0].key).toBe('a')

    trigger.update('show_b')
    expect(tree.items).toHaveLength(1)
    expect(tree.items[0].key).toBe('b')
  })

  it('should hide child nodes based on conditions', () => {
    const { trigger, tree } = createForm({
      schema: defineSchema({
        trigger: { type: 'input-text', defaultValue: 'yes' },
        tree: {
          type: 'tree-select',
          options: [
            {
              key: 'fruits',
              label: 'Fruits',
              children: [
                {
                  key: 'apple',
                  label: 'Apple',
                  conditions: [['trigger', '==', 'yes']],
                },
                { key: 'banana', label: 'Banana' },
              ],
            },
          ],
        },
      }),
    })

    expect(tree.items[0].children).toHaveLength(2)

    trigger.update('no')
    expect(tree.items[0].children).toHaveLength(1)
    expect(tree.items[0].children[0].key).toBe('banana')
  })
})

// =============================================================================
// CONDITIONS - FUNCTIONAL
// =============================================================================
describe('Conditions - functional', () => {
  it('should hide nodes via functional condition', () => {
    const { trigger, tree } = createForm({
      schema: defineSchema({
        trigger: { type: 'input-text', defaultValue: 'yes' },
        tree: {
          type: 'tree-select',
          options: [
            {
              key: 'a',
              label: 'Alpha',
              conditions: (context$: any) =>
                context$.form$?.get('trigger') === 'yes',
            },
            { key: 'b', label: 'Beta' },
          ],
        },
      }),
    })

    expect(tree.items).toHaveLength(2)

    trigger.update('no')
    expect(tree.items).toHaveLength(1)
    expect(tree.items[0].key).toBe('b')
  })
})

// =============================================================================
// CONDITIONS - ASYNC FUNCTIONAL
// =============================================================================
describe('Conditions - async functional', () => {
  it('should hide nodes via async functional condition', async () => {
    const { trigger, tree } = createForm({
      schema: defineSchema({
        trigger: { type: 'input-text', defaultValue: 'yes' },
        tree: {
          type: 'tree-select',
          options: [
            {
              key: 'a',
              label: 'Alpha',
              conditions: async (context$: any) =>
                context$.form$?.get('trigger') === 'yes',
            },
            { key: 'b', label: 'Beta' },
          ],
        },
      }),
    })

    await new Promise((r) => setTimeout(r, 350))
    await flushPromises()

    expect(tree.items).toHaveLength(2)

    trigger.update('no')
    await new Promise((r) => setTimeout(r, 350))
    await flushPromises()

    expect(tree.items).toHaveLength(1)
    expect(tree.items[0].key).toBe('b')
  })
})

// =============================================================================
// UNSET SELECTED VALUE WHEN CONDITIONS BECOME UNAVAILABLE
// =============================================================================
describe('Unset selected values when conditions change', () => {
  describe('default selection mode (checkbox-like object model)', () => {
    it('should unset selected leaf when its own condition becomes unavailable', async () => {
      const { trigger, tree } = createForm({
        schema: defineSchema({
          trigger: { type: 'input-text', defaultValue: 'show' },
          tree: {
            type: 'tree-select',
            selectionMode: 'checkbox',
            defaultValue: { apple: true, banana: true },
            options: [
              {
                key: 'fruits',
                label: 'Fruits',
                children: [
                  {
                    key: 'apple',
                    label: 'Apple',
                    conditions: [['trigger', '==', 'show']],
                  },
                  { key: 'banana', label: 'Banana' },
                ],
              },
            ],
          },
        }),
      })

      expect(tree.model).toEqual({ apple: true, banana: true })

      trigger.update('hide')
      await nextTick()

      expect(tree.model).toEqual({ banana: true })
    })

    it('should unset selected children when parent condition becomes unavailable', async () => {
      const { trigger, tree } = createForm({
        schema: defineSchema({
          trigger: { type: 'input-text', defaultValue: 'show' },
          tree: {
            type: 'tree-select',
            selectionMode: 'checkbox',
            defaultValue: { apple: true, banana: true },
            options: [
              {
                key: 'fruits',
                label: 'Fruits',
                conditions: [['trigger', '==', 'show']],
                children: [
                  { key: 'apple', label: 'Apple' },
                  { key: 'banana', label: 'Banana' },
                ],
              },
              {
                key: 'veggies',
                label: 'Vegetables',
                children: [{ key: 'carrot', label: 'Carrot' }],
              },
            ],
          },
        }),
      })

      expect(tree.model).toEqual({ apple: true, banana: true })

      trigger.update('hide')
      await nextTick()

      expect(tree.items).toHaveLength(1)
      expect(tree.items[0].key).toBe('veggies')
      expect(tree.model).toEqual({})
    })

    it('should reset to empty nullValue when all selected nodes become unavailable', async () => {
      const { trigger, tree } = createForm({
        schema: defineSchema({
          trigger: { type: 'input-text', defaultValue: 'show' },
          tree: {
            type: 'tree-select',
            selectionMode: 'checkbox',
            defaultValue: { a: true },
            options: [
              {
                key: 'a',
                label: 'Alpha',
                conditions: [['trigger', '==', 'show']],
              },
            ],
          },
        }),
      })

      expect(tree.model).toEqual({ a: true })

      trigger.update('hide')
      await nextTick()

      expect(tree.items).toHaveLength(0)
      expect(tree.model).toEqual({})
    })
  })

  describe('selectionMode="single"', () => {
    it('should unset single selection when the node becomes unavailable', async () => {
      const { trigger, tree } = createForm({
        schema: defineSchema({
          trigger: { type: 'input-text', defaultValue: 'show' },
          tree: {
            type: 'tree-select',
            selectionMode: 'single',
            defaultValue: 'a',
            options: [
              {
                key: 'a',
                label: 'Alpha',
                conditions: [['trigger', '==', 'show']],
              },
              { key: 'b', label: 'Beta' },
            ],
          },
        }),
      })

      expect(tree.model).toBe('a')

      trigger.update('hide')
      await nextTick()

      expect(tree.items).toHaveLength(1)
      expect(tree.items[0].key).toBe('b')
    })

    it('should unset single selection when parent condition becomes unavailable', async () => {
      const { trigger, tree } = createForm({
        schema: defineSchema({
          trigger: { type: 'input-text', defaultValue: 'show' },
          tree: {
            type: 'tree-select',
            selectionMode: 'single',
            defaultValue: 'apple',
            options: [
              {
                key: 'fruits',
                label: 'Fruits',
                conditions: [['trigger', '==', 'show']],
                children: [
                  { key: 'apple', label: 'Apple' },
                  { key: 'banana', label: 'Banana' },
                ],
              },
              {
                key: 'veggies',
                label: 'Vegetables',
                children: [{ key: 'carrot', label: 'Carrot' }],
              },
            ],
          },
        }),
      })

      expect(tree.model).toBe('apple')

      trigger.update('hide')
      await nextTick()

      expect(tree.items).toHaveLength(1)
      expect(tree.items[0].key).toBe('veggies')
    })
  })

  describe('selectionMode="checkbox" with expression conditions', () => {
    it('should unset values with expression conditions', async () => {
      const { trigger, tree } = createForm({
        schema: defineSchema({
          trigger: { type: 'input-text', defaultValue: 'show' },
          tree: {
            type: 'tree-select',
            selectionMode: 'checkbox',
            defaultValue: { a: true, b: true },
            options: [
              {
                key: 'a',
                label: 'Alpha',
                conditions: 'trigger == "show"',
              },
              { key: 'b', label: 'Beta' },
            ],
          },
        }),
      })

      expect(tree.model).toEqual({ a: true, b: true })

      trigger.update('hide')
      await nextTick()

      expect(tree.model).toEqual({ b: true })
    })
  })

  describe('selectionMode="checkbox" with functional conditions', () => {
    it('should unset values with functional conditions', async () => {
      const { trigger, tree } = createForm({
        schema: defineSchema({
          trigger: { type: 'input-text', defaultValue: 'show' },
          tree: {
            type: 'tree-select',
            selectionMode: 'checkbox',
            defaultValue: { a: true, b: true },
            options: [
              {
                key: 'a',
                label: 'Alpha',
                conditions: (context$: any) =>
                  context$.form$?.get('trigger') === 'show',
              },
              { key: 'b', label: 'Beta' },
            ],
          },
        }),
      })

      expect(tree.model).toEqual({ a: true, b: true })

      trigger.update('hide')
      await nextTick()

      expect(tree.model).toEqual({ b: true })
    })
  })

  describe('selectionMode="checkbox" with async functional conditions', () => {
    it('should unset values with async functional conditions', async () => {
      const { trigger, tree } = createForm({
        schema: defineSchema({
          trigger: { type: 'input-text', defaultValue: 'show' },
          tree: {
            type: 'tree-select',
            selectionMode: 'checkbox',
            defaultValue: { a: true, b: true },
            options: [
              {
                key: 'a',
                label: 'Alpha',
                conditions: async (context$: any) =>
                  context$.form$?.get('trigger') === 'show',
              },
              { key: 'b', label: 'Beta' },
            ],
          },
        }),
      })

      await new Promise((r) => setTimeout(r, 350))
      await flushPromises()

      expect(tree.model).toEqual({ a: true, b: true })

      trigger.update('hide')
      await new Promise((r) => setTimeout(r, 350))
      await flushPromises()

      expect(tree.model).toEqual({ b: true })
    })
  })
})

// =============================================================================
// REACTIVITY
// =============================================================================
describe('Reactivity', () => {
  it('should react to options prop changes', async () => {
    const schema = ref(
      defineSchema({
        tree: {
          type: 'tree-select',
          options: [
            { key: 'a', label: 'Alpha' },
            { key: 'b', label: 'Beta' },
          ],
        },
      })
    ) as any

    const { tree } = createForm({ schema })

    expect(tree.items).toHaveLength(2)

    schema.value.tree.options = [
      { key: 'a', label: 'Alpha' },
      { key: 'b', label: 'Beta' },
      { key: 'c', label: 'Gamma' },
    ]
    await nextTick()

    expect(tree.items).toHaveLength(3)
    expect(tree.items[2].key).toBe('c')
  })
})
