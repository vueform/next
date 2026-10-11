/*
 * Compile-time assertions for PrimeVue VfSelect options → modelValue inference
 * and defineSchema / SchemaToModel via the definition items key map.
 * Run by `pnpm test-dts`.
 */
import {
  defineSchema,
  type ElementByPath,
  type ModelByPath,
  type SchemaToModel,
} from '@vueform/core'
import { describe, expectTypeOf, test } from 'vitest'
import '@vueform/primevue/components/VfSelect/unstyled'

describe('VfSelect options → modelValue inference', () => {
  test('scalar options — modelValue must be number | null', () => {
    defineSchema({
      bad: {
        type: 'select',
        options: [1, 2, 3],
        // @ts-expect-error string model with number options
        modelValue: 'foo',
      },
      good: {
        type: 'select',
        options: [1, 2, 3],
        modelValue: 1,
      },
      goodNull: {
        type: 'select',
        options: [1, 2, 3],
        modelValue: null,
      },
      // `default` (mapped to PrimeVue's defaultValue prop by the blueprint)
      // is constrained the same way
      badDefault: {
        type: 'select',
        options: [1, 2, 3],
        // @ts-expect-error string default with number options
        default: 'foo',
      },
      goodDefault: {
        type: 'select',
        options: [1, 2, 3],
        default: 2,
      },
    })
  })

  test('optionValue key', () => {
    defineSchema({
      bad: {
        type: 'select',
        options: [
          { id: 1, label: 'A' },
          { id: 2, label: 'B' },
        ],
        optionValue: 'id',
        // @ts-expect-error label string is not the value key
        modelValue: 'A',
      },
      good: {
        type: 'select',
        options: [
          { id: 1, label: 'A' },
          { id: 2, label: 'B' },
        ],
        optionValue: 'id',
        modelValue: 1,
      },
    })
  })

  test('option* key props must be keys of the option shape', () => {
    defineSchema({
      badValue: {
        type: 'select',
        options: [
          { id: 1, label: 'A' },
          { id: 2, label: 'B' },
        ],
        // @ts-expect-error 'idf' is not a key of the option
        optionValue: 'idf',
      },
      badLabel: {
        type: 'select',
        options: [
          { id: 1, label: 'A' },
          { id: 2, label: 'B' },
        ],
        // @ts-expect-error 'title' is not a key of the option
        optionLabel: 'title',
      },
      badDisabled: {
        type: 'select',
        options: [
          { id: 1, label: 'A' },
          { id: 2, label: 'B' },
        ],
        // @ts-expect-error 'off' is not a key of the option
        optionDisabled: 'off',
      },
      goodKeys: {
        type: 'select',
        options: [
          { id: 1, label: 'A' },
          { id: 2, label: 'B' },
        ],
        optionValue: 'id',
        optionLabel: 'label',
      },
    })
  })

  test('key props are forbidden on scalar arrays and record maps', () => {
    defineSchema({
      badScalar: {
        type: 'select',
        options: [1, 2, 3],
        // @ts-expect-error key props are not allowed for scalar options
        optionValue: 'id',
      },
      badRecord: {
        type: 'select',
        options: { us: 'United States', de: 'Germany' },
        // @ts-expect-error key props are not allowed for record-map options
        optionValue: 'us',
      },
    })
  })

  test('optionGroupChildren must be a key of the group object', () => {
    defineSchema({
      badGroup: {
        type: 'select',
        options: [{ label: 'G', items: [{ id: 1, name: 'A' }] }],
        // @ts-expect-error 'kidz' is not a key of the group
        optionGroupChildren: 'kidz',
      },
      goodGroup: {
        type: 'select',
        options: [{ label: 'G', items: [{ id: 1, name: 'A' }] }],
        optionGroupLabel: 'label',
        optionGroupChildren: 'items',
        optionValue: 'id',
        optionLabel: 'name',
      },
    })
  })
})

// =============================================================================
// SchemaToModel / ModelByPath / find
// =============================================================================

const _modelSchema = defineSchema({
  nums: {
    type: 'select',
    options: [1, 2, 3],
  },
  objs: {
    type: 'select',
    options: [
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
    ],
    optionValue: 'id',
  },
  multi: {
    type: 'select',
    options: [1, 2, 3],
    multiple: true,
  },
})

type Model = SchemaToModel<typeof _modelSchema>

describe('SchemaToModel', () => {
  test('derives the model from options — literals are widened to primitives', () => {
    // Pre-restructure these were the literal unions `1 | 2 | 3 | null`,
    // `1 | 2 | null` and `(1 | 2 | 3)[]`; current core widens schema item
    // literals so they must not lock the model.
    expectTypeOf<Model['nums']>().toEqualTypeOf<number | null>()
    expectTypeOf<Model['objs']>().toEqualTypeOf<number | null>()
    expectTypeOf<Model['multi']>().toEqualTypeOf<number[]>()
  })
})

describe('ModelByPath', () => {
  test('derives the model for a path from the schema entry', () => {
    // Pre-restructure: `1 | 2 | 3 | null` / `1 | 2 | null` (now widened).
    expectTypeOf<ModelByPath<typeof _modelSchema, 'nums'>>().toEqualTypeOf<
      number | null
    >()
    expectTypeOf<ModelByPath<typeof _modelSchema, 'objs'>>().toEqualTypeOf<
      number | null
    >()
  })
})

describe('ElementByPath (form$.find)', () => {
  type FindNums = ElementByPath<typeof _modelSchema, 'nums'>
  type FindObjs = ElementByPath<typeof _modelSchema, 'objs'>
  type FindMulti = ElementByPath<typeof _modelSchema, 'multi'>

  test('narrows value from the entry', () => {
    // Pre-restructure: `1 | 2 | 3 | null` / `(1 | 2 | 3)[]` (now widened).
    expectTypeOf<FindNums['value']>().toEqualTypeOf<number | null>()
    expectTypeOf<FindMulti['value']>().toEqualTypeOf<number[]>()
  })

  test('items overlay is not narrowed from the `options` shape', () => {
    // The pre-restructure ElementContextByPath narrowed these to the option
    // value unions; the current ElementByPath overlay derives resolved items
    // from the core `items` prop, so the PrimeVue `options` shape does not
    // flow in and `value` stays `any`.
    expectTypeOf<FindNums['items'][number]['value']>().toBeAny()
    expectTypeOf<FindObjs['items'][number]['value']>().toBeAny()
  })

  test('keeps the base element context (fire)', () => {
    expectTypeOf<FindNums>().toHaveProperty('fire')
  })
})
