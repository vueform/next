/*
 * Compile-time assertions for PrimeVue VfSelect options → modelValue inference
 * and defineSchema / SchemaToModel via the definition items key map.
 */
import {
  defineSchema,
  type ElementContextByPath,
  type ModelByPath,
  type SchemaToModel,
} from '@vueform/core'
import '@/components/VfSelect/unstyled'

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false
type Expect<T extends true> = T

// options scalar items — modelValue must be number | null
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
  // defaultValue (not default) is constrained the same way
  badDefault: {
    type: 'select',
    options: [1, 2, 3],
    // @ts-expect-error string defaultValue with number options
    defaultValue: 'foo',
  },
  goodDefault: {
    type: 'select',
    options: [1, 2, 3],
    defaultValue: 2,
  },
})

// optionValue key
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

// option* key props must be keys of the option shape
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

// Key props are forbidden on scalar arrays and record maps
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

// optionGroupChildren must be a key of the group object
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

// SchemaToModel / ModelByPath / find
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

type _nums = Expect<Equal<Model['nums'], 1 | 2 | 3 | null>>
type _objs = Expect<Equal<Model['objs'], 1 | 2 | null>>
type _multi = Expect<Equal<Model['multi'], (1 | 2 | 3)[]>>

type _pathNums = Expect<
  Equal<ModelByPath<typeof _modelSchema, 'nums'>, 1 | 2 | 3 | null>
>
type _pathObjs = Expect<
  Equal<ModelByPath<typeof _modelSchema, 'objs'>, 1 | 2 | null>
>

type FindNums = ElementContextByPath<typeof _modelSchema, 'nums'>
type FindObjs = ElementContextByPath<typeof _modelSchema, 'objs'>
type FindMulti = ElementContextByPath<typeof _modelSchema, 'multi'>

type _findNumsValue = Expect<Equal<FindNums['value'], 1 | 2 | 3 | null>>
type _findMultiValue = Expect<Equal<FindMulti['value'], (1 | 2 | 3)[]>>
type _findNumsItemValue = Expect<
  Equal<FindNums['items'][number]['value'], 1 | 2 | 3>
>
type _findObjsItemValue = Expect<
  Equal<FindObjs['items'][number]['value'], 1 | 2>
>
type _findNumsHasFire = Expect<'fire' extends keyof FindNums ? true : false>

type _all =
  | _nums
  | _objs
  | _multi
  | _pathNums
  | _pathObjs
  | _findNumsValue
  | _findMultiValue
  | _findNumsItemValue
  | _findObjsItemValue
  | _findNumsHasFire
void null as any as _all
