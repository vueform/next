/*
 * Compile-time assertions for PrimeVue VfAutoComplete suggestions → model
 * inference (no optionValue — model is the whole item / scalar).
 * Run by `pnpm test:dts`.
 */
import {
  defineSchema,
  type ElementByPath,
  type ModelByPath,
  type SchemaToModel,
} from '@vueform/core'
import { describe, expectTypeOf, test } from 'vitest'
import '@vueform/primevue/components/VfAutoComplete/unstyled'

describe('VfAutoComplete suggestions → modelValue inference', () => {
  test('scalar suggestions — model is the scalar', () => {
    defineSchema({
      bad: {
        type: 'auto-complete',
        suggestions: [1, 2, 3],
        // @ts-expect-error string model with number suggestions
        modelValue: 'foo',
      },
      good: {
        type: 'auto-complete',
        suggestions: [1, 2, 3],
        modelValue: 1,
      },
      goodNull: {
        type: 'auto-complete',
        suggestions: [1, 2, 3],
        modelValue: null,
      },
    })
  })

  test('object suggestions — model is the whole object (no optionValue)', () => {
    defineSchema({
      bad: {
        type: 'auto-complete',
        suggestions: [
          { id: 1, label: 'A' },
          { id: 2, label: 'B' },
        ],
        // @ts-expect-error id alone is not the whole item
        modelValue: 1,
      },
      good: {
        type: 'auto-complete',
        suggestions: [
          { id: 1, label: 'A' },
          { id: 2, label: 'B' },
        ],
        modelValue: { id: 1, label: 'A' },
      },
      // optionLabel is display-only; does not change the model
      withLabel: {
        type: 'auto-complete',
        suggestions: [
          { id: 1, label: 'A' },
          { id: 2, label: 'B' },
        ],
        optionLabel: 'label',
        modelValue: { id: 2, label: 'B' },
      },
    })
  })

  test('optionLabel must be a key of the suggestion shape', () => {
    defineSchema({
      badLabel: {
        type: 'auto-complete',
        suggestions: [
          { id: 1, label: 'A' },
          { id: 2, label: 'B' },
        ],
        // @ts-expect-error 'title' is not a key of the suggestion
        optionLabel: 'title',
      },
      goodLabel: {
        type: 'auto-complete',
        suggestions: [
          { id: 1, label: 'A' },
          { id: 2, label: 'B' },
        ],
        optionLabel: 'label',
      },
    })
  })

  test('multiple: true → array of whole items / scalars', () => {
    defineSchema({
      bad: {
        type: 'auto-complete',
        suggestions: [1, 2, 3],
        multiple: true,
        // @ts-expect-error single value when multiple
        modelValue: 1,
      },
      good: {
        type: 'auto-complete',
        suggestions: [1, 2, 3],
        multiple: true,
        modelValue: [1, 2],
      },
    })
  })
})

const _modelSchema = defineSchema({
  nums: {
    type: 'auto-complete',
    suggestions: [1, 2, 3],
  },
  objs: {
    type: 'auto-complete',
    suggestions: [
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
    ],
  },
  multi: {
    type: 'auto-complete',
    suggestions: [1, 2, 3],
    multiple: true,
  },
})

type Model = SchemaToModel<typeof _modelSchema>

describe('SchemaToModel', () => {
  test('derives the model from suggestions — literals are widened to primitives', () => {
    // Pre-restructure these were the literal unions `1 | 2 | 3 | null`,
    // `{ readonly id: 1; readonly label: 'A' } | { readonly id: 2; readonly label: 'B' } | null`
    // and `(1 | 2 | 3)[]`; current core widens schema item literals so they
    // must not lock the model.
    expectTypeOf<Model['nums']>().toEqualTypeOf<number | null>()
    // `objs` resolves to a `NoInfer<...>`-wrapped union; the wrapper is
    // identity-equal to the plain type but defeats expect-type's branded
    // equality, so the expected side carries the same wrapper.
    expectTypeOf<Model['objs']>().toEqualTypeOf<
      NoInfer<{ id: number; label: string } | null>
    >()
    expectTypeOf<Model['multi']>().toEqualTypeOf<number[]>()
  })
})

describe('ModelByPath', () => {
  test('derives the model for a path from the schema entry', () => {
    // Pre-restructure: `1 | 2 | 3 | null` (now widened).
    expectTypeOf<ModelByPath<typeof _modelSchema, 'nums'>>().toEqualTypeOf<
      number | null
    >()
  })
})

describe('ElementByPath (form$.find)', () => {
  type FindNums = ElementByPath<typeof _modelSchema, 'nums'>
  type FindObjs = ElementByPath<typeof _modelSchema, 'objs'>

  test('narrows value from the entry', () => {
    // Pre-restructure: literal unions (now widened; `objs` carries the same
    // `NoInfer<...>` wrapper as its SchemaToModel entry).
    expectTypeOf<FindNums['value']>().toEqualTypeOf<number | null>()
    expectTypeOf<FindObjs['value']>().toEqualTypeOf<
      NoInfer<{ id: number; label: string } | null>
    >()
  })
})
