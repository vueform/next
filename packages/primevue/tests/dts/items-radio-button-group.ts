/*
 * Compile-time assertions for PrimeVue VfRadioButtonGroup options → model
 * inference (always Value | null).
 */
import {
  defineSchema,
  type ElementContextByPath,
  type SchemaToModel,
} from '@vueform/core'
import '@/components/VfRadioButtonGroup/unstyled'

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false
type Expect<T extends true> = T

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
type _nums = Expect<Equal<Model['nums'], 1 | 2 | 3 | null>>
type _objs = Expect<Equal<Model['objs'], 1 | 2 | null>>

type FindNums = ElementContextByPath<typeof _modelSchema, 'nums'>
type _find = Expect<Equal<FindNums['value'], 1 | 2 | 3 | null>>

type _all = _nums | _objs | _find
void null as any as _all
