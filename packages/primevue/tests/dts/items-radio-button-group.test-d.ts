/*
 * Compile-time assertions for PrimeVue VfRadioButtonGroup options → model
 * inference (always Value | null). Run by `pnpm test:dts`.
 */
import {
  defineSchema,
  type ElementByPath,
  type SchemaToModel,
} from '@vueform/core'
import { describe, expectTypeOf, test } from 'vitest'
import '@vueform/primevue/components/VfRadioButtonGroup/unstyled'

describe('defineSchema radio-button-group options → modelValue inference', () => {
  test('modelValue is always Value | null', () => {
    defineSchema({
      bad: {
        type: 'radio-button-group',
        options: [1, 2, 3],
        // @ts-expect-error string model with number options
        modelValue: 'foo',
      },
      good: {
        type: 'radio-button-group',
        options: [1, 2, 3],
        modelValue: 1,
      },
      goodNull: {
        type: 'radio-button-group',
        options: [1, 2, 3],
        modelValue: null,
      },
      objs: {
        type: 'radio-button-group',
        options: [
          { id: 1, label: 'A' },
          { id: 2, label: 'B' },
        ],
        optionValue: 'id',
        modelValue: 1,
      },
    })
  })
})

const _modelSchema = defineSchema({
  nums: {
    type: 'radio-button-group',
    options: [1, 2, 3],
  },
  objs: {
    type: 'radio-button-group',
    options: [
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
    ],
    optionValue: 'id',
  },
})

type Model = SchemaToModel<typeof _modelSchema>

describe('SchemaToModel', () => {
  test('derives Value | null models from radio-button-group options', () => {
    // Schema options are widened to primitives — literals must not lock the
    // model. (The source assertions predate the widening and expected
    // 1 | 2 | 3 | null / 1 | 2 | null.)
    expectTypeOf<Model['nums']>().toEqualTypeOf<number | null>()
    expectTypeOf<Model['objs']>().toEqualTypeOf<number | null>()
  })
})

describe('ElementByPath (form$.find)', () => {
  test('narrows value from the schema entry', () => {
    type FindNums = ElementByPath<typeof _modelSchema, 'nums'>

    expectTypeOf<FindNums['value']>().toEqualTypeOf<number | null>()
  })
})
