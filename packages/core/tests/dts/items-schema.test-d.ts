/*
 * Type-level tests for defineSchema items → modelValue inference and
 * SchemaToModel / ModelByPath derivation from items.
 * Run by `pnpm test-dts`.
 */
import {
  defineSchema,
  type ElementByPath,
  type ModelByPath,
  type SchemaToModel,
} from '@vueform/core'
import { describe, expectTypeOf, test } from 'vitest'

describe('defineSchema items → modelValue inference', () => {
  test('scalar number items — modelValue must be number | null', () => {
    defineSchema({
      bad: {
        type: 'select',
        items: [1, 2, 3],
        // @ts-expect-error string model with number items
        modelValue: 'foo',
      },
      good: {
        type: 'select',
        items: [1, 2, 3],
        modelValue: 1,
      },
      goodNull: {
        type: 'select',
        items: [1, 2, 3],
        modelValue: null,
      },
    })
  })

  test('scalar string items', () => {
    defineSchema({
      bad: {
        type: 'select',
        items: ['x', 'y'],
        // @ts-expect-error number model with string items
        modelValue: 123,
      },
      good: {
        type: 'select',
        items: ['x', 'y'],
        modelValue: 'x',
      },
    })
  })

  test('object items + itemValue key', () => {
    defineSchema({
      bad: {
        type: 'select',
        items: [
          { id: 1, label: 'A' },
          { id: 2, label: 'B' },
        ],
        itemValue: 'id',
        // @ts-expect-error label string is not the value key
        modelValue: 'A',
      },
      good: {
        type: 'select',
        items: [
          { id: 1, label: 'A' },
          { id: 2, label: 'B' },
        ],
        itemValue: 'id',
        modelValue: 1,
      },
    })
  })

  test('object items — item-key props must be keys of the item shape', () => {
    defineSchema({
      badValue: {
        type: 'select',
        items: [
          { id: 1, label: 'A' },
          { id: 2, label: 'B' },
        ],
        // @ts-expect-error 'idf' is not a key of the item
        itemValue: 'idf',
      },
      badLabel: {
        type: 'select',
        items: [
          { id: 1, label: 'A' },
          { id: 2, label: 'B' },
        ],
        // @ts-expect-error 'title' is not a key of the item
        itemLabel: 'title',
      },
      goodKeys: {
        type: 'select',
        items: [
          { id: 1, label: 'A' },
          { id: 2, label: 'B' },
        ],
        itemValue: 'id',
        itemLabel: 'label',
      },
    })
  })

  test('key props are forbidden on scalar arrays and record maps', () => {
    defineSchema({
      badScalar: {
        type: 'select',
        items: [1, 2, 3],
        // @ts-expect-error key props are not allowed for scalar items
        itemValue: 'id',
      },
      badRecord: {
        type: 'select',
        items: { us: 'United States', de: 'Germany' },
        // @ts-expect-error key props are not allowed for record-map items
        itemValue: 'us',
      },
    })
  })

  test('groupChildren must be a key of the group object', () => {
    defineSchema({
      badGroup: {
        type: 'select',
        items: [{ label: 'G', children: [{ id: 1, name: 'A' }] }],
        // @ts-expect-error 'kidz' is not a key of the group
        groupChildren: 'kidz',
      },
      goodGroup: {
        type: 'select',
        items: [{ label: 'G', children: [{ id: 1, name: 'A' }] }],
        groupChildren: 'children',
        itemValue: 'id',
        itemLabel: 'name',
      },
    })
  })

  test('array notation and radios share the same item-key check', () => {
    defineSchema([
      {
        name: 'country',
        type: 'select',
        items: [
          { id: 'us', name: 'United States' },
          { id: 'de', name: 'Germany' },
        ],
        // @ts-expect-error 'idf' is not a key of the item
        itemValue: 'idf',
      },
    ])

    defineSchema({
      badRadios: {
        type: 'radios',
        items: [
          { id: 1, label: 'A' },
          { id: 2, label: 'B' },
        ],
        // @ts-expect-error 'nope' is not a key of the item
        itemValue: 'nope',
      },
    })
  })

  test('object items without itemValue — whole object is the model', () => {
    defineSchema({
      good: {
        type: 'select',
        items: [
          { id: 1, label: 'A' },
          { id: 2, label: 'B' },
        ],
        modelValue: { id: 1, label: 'A' },
      },
    })
  })

  test('multiple: true → array model', () => {
    defineSchema({
      bad: {
        type: 'select',
        items: [1, 2, 3],
        multiple: true,
        // @ts-expect-error single value when multiple
        modelValue: 1,
      },
      good: {
        type: 'select',
        items: [1, 2, 3],
        multiple: true,
        modelValue: [1, 2],
      },
    })
  })

  test('radios — always single (Value | null)', () => {
    defineSchema({
      bad: {
        type: 'radios',
        items: [1, 2, 3] as const,
        // @ts-expect-error string model with number items
        modelValue: 'foo',
      },
      badArray: {
        type: 'radios',
        items: [1, 2, 3] as const,
        // @ts-expect-error array model on single-select radios
        modelValue: [1],
      },
      good: {
        type: 'radios',
        items: [1, 2, 3] as const,
        modelValue: 1,
      },
      goodNull: {
        type: 'radios',
        items: [1, 2, 3] as const,
        modelValue: null,
      },
    })
  })

  test('checkboxes — always multi (Value[])', () => {
    defineSchema({
      bad: {
        type: 'checkboxes',
        items: [1, 2, 3] as const,
        // @ts-expect-error single value when multi checkboxes
        modelValue: 1,
      },
      badString: {
        type: 'checkboxes',
        items: [1, 2, 3] as const,
        // @ts-expect-error string array with number items
        modelValue: ['foo'],
      },
      good: {
        type: 'checkboxes',
        items: [1, 2, 3] as const,
        modelValue: [1, 2],
      },
      goodEmpty: {
        type: 'checkboxes',
        items: [1, 2, 3] as const,
        modelValue: [],
      },
    })
  })

  test('default is constrained the same way', () => {
    defineSchema({
      bad: {
        type: 'select',
        items: [1, 2, 3],
        // @ts-expect-error string default with number items
        default: 'foo',
      },
      good: {
        type: 'select',
        items: [1, 2, 3],
        default: 2,
      },
    })
  })

  test('record map items — model is key type', () => {
    defineSchema({
      bad: {
        type: 'select',
        items: { us: 'United States', de: 'Germany' },
        // @ts-expect-error value is not a key
        modelValue: 'United States',
      },
      good: {
        type: 'select',
        items: { us: 'United States', de: 'Germany' },
        modelValue: 'us',
      },
    })
  })

  test('itemValue mapper return drives model', () => {
    defineSchema({
      bad: {
        type: 'select',
        items: [
          { id: 1, label: 'A' },
          { id: 2, label: 'B' },
        ],
        itemValue: (item: { id: number; label: string }) => item.id,
        // @ts-expect-error mapper returns number
        modelValue: 'A',
      },
      good: {
        type: 'select',
        items: [
          { id: 1, label: 'A' },
          { id: 2, label: 'B' },
        ],
        itemValue: (item: { id: number; label: string }) => item.id,
        modelValue: 1,
      },
    })
  })

  test('endpoint URL items — model stays loose', () => {
    defineSchema({
      select: {
        type: 'select',
        items: '/api/items',
        modelValue: 'anything',
      },
    })
  })

  test('non-items elements are unaffected', () => {
    defineSchema({
      text: {
        type: 'text',
        modelValue: 'anything',
      },
      agree: {
        type: 'checkbox',
      },
    })
  })

  test('array schema notation', () => {
    defineSchema([
      {
        name: 'select',
        type: 'select',
        items: [1, 2, 3],
        // @ts-expect-error string model with number items
        modelValue: 'foo',
      },
      {
        name: 'ok',
        type: 'select',
        items: [1, 2, 3],
        modelValue: 1,
      },
    ] as const)
  })

  test('preserve literal schema type on return', () => {
    const schema = defineSchema({
      select: {
        type: 'select',
        items: [1, 2, 3] as const,
        modelValue: 1 as const,
      },
    })

    expectTypeOf(schema.select.items).toEqualTypeOf<readonly [1, 2, 3]>()
  })
})

// =============================================================================
// SchemaToModel / ModelByPath
// =============================================================================

const _modelSchema = defineSchema({
  nums: {
    type: 'select',
    items: [1, 2, 3] as const,
  },
  strs: {
    type: 'select',
    items: ['x', 'y'] as const,
  },
  objs: {
    type: 'select',
    items: [
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
    ] as const,
    itemValue: 'id' as const,
  },
  whole: {
    type: 'select',
    items: [
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
    ] as const,
  },
  multi: {
    type: 'select',
    items: [1, 2, 3] as const,
    multiple: true as const,
  },
  map: {
    type: 'select',
    items: { us: 'United States', de: 'Germany' } as const,
  },
  endpoint: {
    type: 'select',
    items: '/api/items',
  },
  name: {
    type: 'text',
  },
  radios: {
    type: 'radios',
    items: [1, 2, 3] as const,
  },
  checkboxes: {
    type: 'checkboxes',
    items: [1, 2, 3] as const,
  },
  radiosObjs: {
    type: 'radios',
    items: [
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
    ] as const,
    itemValue: 'id' as const,
  },
  checkboxesObjs: {
    type: 'checkboxes',
    items: [
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
    ] as const,
    itemValue: 'id' as const,
  },
})

type Model = SchemaToModel<typeof _modelSchema>

describe('SchemaToModel', () => {
  test('schema items are widened to primitives — literals must not lock the model', () => {
    // (defineSchema's `const` type parameter narrows every items array.)
    expectTypeOf<Model['nums']>().toEqualTypeOf<number | null>()
    expectTypeOf<Model['strs']>().toEqualTypeOf<string | null>()
    expectTypeOf<Model['objs']>().toEqualTypeOf<number | null>()
    // `whole` resolves to a `NoInfer<...>`-wrapped union; the wrapper is
    // identity-equal to the plain type but defeats expect-type's branded
    // equality, so the expected side carries the same wrapper.
    expectTypeOf<Model['whole']>().toEqualTypeOf<
      NoInfer<{ id: number; label: string } | null>
    >()
    expectTypeOf<Model['multi']>().toEqualTypeOf<number[]>()
    // Record-map keys are structural (not const-narrowing artifacts), so they stay literal
    expectTypeOf<Model['map']>().toEqualTypeOf<'us' | 'de' | null>()
    expectTypeOf<Model['endpoint']>().toBeAny()
    // VfText without `translate` narrows to the plain scalar model
    expectTypeOf<Model['name']>().toEqualTypeOf<string | number | null>()
    expectTypeOf<Model['radios']>().toEqualTypeOf<number | null>()
    expectTypeOf<Model['checkboxes']>().toEqualTypeOf<number[]>()
    expectTypeOf<Model['radiosObjs']>().toEqualTypeOf<number | null>()
    expectTypeOf<Model['checkboxesObjs']>().toEqualTypeOf<number[]>()
  })
})

describe('ModelByPath', () => {
  test('derives the model for a path from the schema entry', () => {
    expectTypeOf<ModelByPath<typeof _modelSchema, 'nums'>>().toEqualTypeOf<
      number | null
    >()
    expectTypeOf<ModelByPath<typeof _modelSchema, 'objs'>>().toEqualTypeOf<
      number | null
    >()
    expectTypeOf<ModelByPath<typeof _modelSchema, 'multi'>>().toEqualTypeOf<
      number[]
    >()
    expectTypeOf<ModelByPath<typeof _modelSchema, 'name'>>().toEqualTypeOf<
      string | number | null
    >()
    expectTypeOf<ModelByPath<typeof _modelSchema, 'radios'>>().toEqualTypeOf<
      number | null
    >()
    expectTypeOf<
      ModelByPath<typeof _modelSchema, 'checkboxes'>
    >().toEqualTypeOf<number[]>()
  })
})

describe('ElementByPath (form$.find)', () => {
  type FindNums = ElementByPath<typeof _modelSchema, 'nums'>
  type FindObjs = ElementByPath<typeof _modelSchema, 'objs'>
  type FindMulti = ElementByPath<typeof _modelSchema, 'multi'>
  type FindRadios = ElementByPath<typeof _modelSchema, 'radios'>
  type FindCheckboxes = ElementByPath<typeof _modelSchema, 'checkboxes'>

  test('narrows value/model/update from the entry', () => {
    expectTypeOf<FindNums['value']>().toEqualTypeOf<number | null>()
    expectTypeOf<FindNums['model']>().toEqualTypeOf<number | null>()
    expectTypeOf<Parameters<FindNums['update']>[0]>().toEqualTypeOf<
      number | null
    >()
    expectTypeOf<FindObjs['value']>().toEqualTypeOf<number | null>()
    expectTypeOf<FindMulti['value']>().toEqualTypeOf<number[]>()
    expectTypeOf<FindRadios['value']>().toEqualTypeOf<number | null>()
    expectTypeOf<FindCheckboxes['value']>().toEqualTypeOf<number[]>()
  })

  test('overlays resolved items/groups from the schema items shape', () => {
    expectTypeOf<FindNums['items'][number]['value']>().toEqualTypeOf<number>()
    expectTypeOf<FindObjs['items'][number]['value']>().toEqualTypeOf<number>()
    expectTypeOf<FindRadios['items'][number]['value']>().toEqualTypeOf<number>()
    expectTypeOf<
      FindCheckboxes['items'][number]['value']
    >().toEqualTypeOf<number>()
  })

  test('non-model elements (button) must not gain value/model/load/update from the overlay', () => {
    const _buttonSchema = defineSchema({
      button: { type: 'button' },
      select: { type: 'select', items: [1, 2, 3] as const },
    })
    type FindButton = ElementByPath<typeof _buttonSchema, 'button'>

    expectTypeOf<FindButton>().not.toHaveProperty('value')
    expectTypeOf<FindButton>().not.toHaveProperty('model')
    expectTypeOf<FindButton>().not.toHaveProperty('load')
    expectTypeOf<FindButton>().not.toHaveProperty('update')
    expectTypeOf<FindButton>().toHaveProperty('fire')
  })
})

// ============ Schema onChange el$ typing (VfSelect pilot) ============
// The select definition's events are VfSelectEmits, so `el$` in schema
// on* handlers gets the full blueprint-derived NewContextOf<'VfSelect'> via
// discriminated-union contextual typing — while items→model validation
// (asserted above) keeps working.

describe('schema onChange el$ typing (VfSelect pilot)', () => {
  test('el$ gets the full blueprint-derived context', () => {
    defineSchema({
      eventSelect: {
        type: 'select',
        items: [
          { id: 1, label: 'A' },
          { id: 2, label: 'B' },
        ],
        itemValue: 'id',
        onChange(_n, _o, el$) {
          expectTypeOf(el$.path).toExtend<string>()
          void el$.validate
          void el$.items
          void el$.model
          void el$.form$
          // @ts-expect-error unknown key must error on the full context
          void el$.definitelyNotARealProp
        },
      },
    })
  })
})
