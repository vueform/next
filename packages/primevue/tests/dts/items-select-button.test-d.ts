/*
 * Compile-time assertions for PrimeVue VfSelectButton options → model inference
 * (flat options; optional multiple).
 * Run by `pnpm test-dts`.
 */
import {
  defineSchema,
  type ElementByPath,
  type SchemaToModel,
} from '@vueform/core'
import { describe, expectTypeOf, test } from 'vitest'
import '@vueform/primevue/components/VfSelectButton/unstyled'

describe('VfSelectButton options → modelValue inference', () => {
  test('scalar options — model is the scalar; multiple: true → array', () => {
    defineSchema({
      bad: {
        type: 'select-button',
        options: [1, 2, 3],
        // @ts-expect-error string model with number options
        modelValue: 'foo',
      },
      good: {
        type: 'select-button',
        options: [1, 2, 3],
        modelValue: 1,
      },
      goodMulti: {
        type: 'select-button',
        options: [1, 2, 3],
        multiple: true,
        modelValue: [1, 2],
      },
    })
  })
})

const _modelSchema = defineSchema({
  single: {
    type: 'select-button',
    options: [1, 2, 3],
  },
  objs: {
    type: 'select-button',
    options: [
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
    ],
    optionValue: 'id',
  },
  multi: {
    type: 'select-button',
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
    expectTypeOf<Model['single']>().toEqualTypeOf<number | null>()
    expectTypeOf<Model['objs']>().toEqualTypeOf<number | null>()
    expectTypeOf<Model['multi']>().toEqualTypeOf<number[]>()
  })
})

describe('ElementByPath (form$.find)', () => {
  test('narrows value from the entry', () => {
    type FindSingle = ElementByPath<typeof _modelSchema, 'single'>

    // Pre-restructure: `1 | 2 | 3 | null` (now widened).
    expectTypeOf<FindSingle['value']>().toEqualTypeOf<number | null>()
  })
})
