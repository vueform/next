/*
 * Compile-time assertions for PrimeVue VfMultiSelect options → model inference
 * (always Value[]).
 */
import {
  defineSchema,
  type ElementContextByPath,
  type SchemaToModel,
} from '@vueform/core'
import '@/components/VfMultiSelect/unstyled'

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false
type Expect<T extends true> = T

defineSchema({
  bad: {
    type: 'multi-select',
    options: [1, 2, 3],
    // @ts-expect-error single value when always multiple
    modelValue: 1,
  },
  good: {
    type: 'multi-select',
    options: [1, 2, 3],
    modelValue: [1, 2],
  },
  objs: {
    type: 'multi-select',
    options: [
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
    ],
    optionValue: 'id',
    modelValue: [1],
  },
  badKey: {
    type: 'multi-select',
    options: [
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
    ],
    // @ts-expect-error 'idf' is not a key of the option
    optionValue: 'idf',
  },
})

const _modelSchema = defineSchema({
  nums: {
    type: 'multi-select',
    options: [1, 2, 3],
  },
  objs: {
    type: 'multi-select',
    options: [
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
    ],
    optionValue: 'id',
  },
})

type Model = SchemaToModel<typeof _modelSchema>
type _nums = Expect<Equal<Model['nums'], (1 | 2 | 3)[]>>
type _objs = Expect<Equal<Model['objs'], (1 | 2)[]>>

type FindNums = ElementContextByPath<typeof _modelSchema, 'nums'>
type _find = Expect<Equal<FindNums['value'], (1 | 2 | 3)[]>>

type _all = _nums | _objs | _find
void null as any as _all
