/*
 * Compile-time assertions for PrimeVue VfAutoComplete suggestions → model
 * inference (no optionValue — model is the whole item / scalar).
 */
import {
  defineSchema,
  type ElementContextByPath,
  type ModelByPath,
  type SchemaToModel,
} from '@vueform/core'
import '@/components/VfAutoComplete/unstyled'

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false
type Expect<T extends true> = T

// Scalar suggestions — model is the scalar
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

// Object suggestions — model is the whole object (no optionValue)
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

// optionLabel must be a key of the suggestion shape
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

// multiple: true → array of whole items / scalars
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

type _nums = Expect<Equal<Model['nums'], 1 | 2 | 3 | null>>
type _objs = Expect<
  Equal<
    Model['objs'],
    | { readonly id: 1; readonly label: 'A' }
    | { readonly id: 2; readonly label: 'B' }
    | null
  >
>
type _multi = Expect<Equal<Model['multi'], (1 | 2 | 3)[]>>

type _pathNums = Expect<
  Equal<ModelByPath<typeof _modelSchema, 'nums'>, 1 | 2 | 3 | null>
>

type FindNums = ElementContextByPath<typeof _modelSchema, 'nums'>
type FindObjs = ElementContextByPath<typeof _modelSchema, 'objs'>

type _findNumsValue = Expect<Equal<FindNums['value'], 1 | 2 | 3 | null>>
type _findObjsValue = Expect<
  Equal<
    FindObjs['value'],
    | { readonly id: 1; readonly label: 'A' }
    | { readonly id: 2; readonly label: 'B' }
    | null
  >
>

type _all = _nums | _objs | _multi | _pathNums | _findNumsValue | _findObjsValue
void null as any as _all
