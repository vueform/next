/*
 * Compile-time assertions for PrimeVue VfCheckboxGroup options → model
 * inference (always Value[]). Run by `pnpm test:dts`.
 */
import {
  defineSchema,
  type ElementByPath,
  type SchemaToModel,
} from '@vueform/core'
import { describe, expectTypeOf, test } from 'vitest'
import '@vueform/primevue/components/VfCheckboxGroup/unstyled'

describe('defineSchema checkbox-group options → modelValue inference', () => {
  test('modelValue is always Value[] and optionValue must be a key of the option', () => {
    defineSchema({
      bad: {
        type: 'checkbox-group',
        options: [1, 2, 3],
        // @ts-expect-error single value when always multiple
        modelValue: 1,
      },
      good: {
        type: 'checkbox-group',
        options: [1, 2, 3],
        modelValue: [1, 2],
      },
      objs: {
        type: 'checkbox-group',
        options: [
          { id: 1, label: 'A' },
          { id: 2, label: 'B' },
        ],
        optionValue: 'id',
        modelValue: [1],
      },
      badKey: {
        type: 'checkbox-group',
        options: [
          { id: 1, label: 'A' },
          { id: 2, label: 'B' },
        ],
        // @ts-expect-error 'idf' is not a key of the option
        optionValue: 'idf',
      },
    })
  })
})

const _modelSchema = defineSchema({
  nums: {
    type: 'checkbox-group',
    options: [1, 2, 3],
  },
  objs: {
    type: 'checkbox-group',
    options: [
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
    ],
    optionValue: 'id',
  },
})

type Model = SchemaToModel<typeof _modelSchema>

describe('SchemaToModel', () => {
  test('derives Value[] models from checkbox-group options', () => {
    // Schema options are widened to primitives — literals must not lock the
    // model. (The source assertions predate the widening and expected
    // (1 | 2 | 3)[] / (1 | 2)[].)
    expectTypeOf<Model['nums']>().toEqualTypeOf<number[]>()
    expectTypeOf<Model['objs']>().toEqualTypeOf<number[]>()
  })
})

describe('ElementByPath (form$.find)', () => {
  test('narrows value from the schema entry', () => {
    type FindNums = ElementByPath<typeof _modelSchema, 'nums'>

    expectTypeOf<FindNums['value']>().toEqualTypeOf<number[]>()
  })
})
