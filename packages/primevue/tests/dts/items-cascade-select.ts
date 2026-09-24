/*
 * Compile-time assertions for PrimeVue VfCascadeSelect options → model
 * inference (including optionGroupChildren path arrays).
 */
import {
  defineSchema,
  type ElementContextByPath,
  type ModelByPath,
  type SchemaToModel,
} from '@vueform/core'
import '@/components/VfCascadeSelect/unstyled'

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false
type Expect<T extends true> = T

const cascadeOptions = [
  {
    name: 'Australia',
    code: 'AU',
    states: [
      {
        name: 'New South Wales',
        cities: [
          { cname: 'Sydney', code: 'A-SY' },
          { cname: 'Newcastle', code: 'A-NE' },
        ],
      },
    ],
  },
  {
    name: 'Canada',
    code: 'CA',
    states: [
      {
        name: 'Quebec',
        cities: [{ cname: 'Montreal', code: 'C-MO' }],
      },
    ],
  },
] as const

// optionValue key — model from top-level item shape when path-array children
// cannot deepen ItemsModel (PrimeVue navigates the tree at runtime)
defineSchema({
  bad: {
    type: 'cascade-select',
    options: cascadeOptions,
    optionGroupChildren: ['states', 'cities'],
    optionValue: 'code',
    // @ts-expect-error number model with string code
    modelValue: 123,
  },
  good: {
    type: 'cascade-select',
    options: cascadeOptions,
    optionGroupChildren: ['states', 'cities'],
    optionValue: 'code',
    modelValue: 'AU',
  },
  goodNull: {
    type: 'cascade-select',
    options: cascadeOptions,
    optionGroupChildren: ['states', 'cities'],
    optionValue: 'code',
    modelValue: null,
  },
})

// option* key props must be keys of the option / group shape
defineSchema({
  badValue: {
    type: 'cascade-select',
    options: cascadeOptions,
    optionGroupChildren: ['states', 'cities'],
    // @ts-expect-error 'cname' is not a key of the top-level option
    optionValue: 'cname',
  },
  badGroupLabel: {
    type: 'cascade-select',
    options: cascadeOptions,
    // @ts-expect-error 'title' is not a key of the group
    optionGroupLabel: 'title',
    optionGroupChildren: ['states', 'cities'],
  },
  goodKeys: {
    type: 'cascade-select',
    options: cascadeOptions,
    optionGroupLabel: 'name',
    optionGroupChildren: ['states', 'cities'],
    optionValue: 'code',
    optionLabel: 'name',
  },
})

// Whole object model when optionValue is omitted
defineSchema({
  good: {
    type: 'cascade-select',
    options: cascadeOptions,
    optionGroupChildren: ['states', 'cities'],
    modelValue: cascadeOptions[0],
  },
})

const _modelSchema = defineSchema({
  country: {
    type: 'cascade-select',
    options: cascadeOptions,
    optionGroupChildren: ['states', 'cities'],
    optionValue: 'code',
  },
  whole: {
    type: 'cascade-select',
    options: [
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
    ],
  },
})

type Model = SchemaToModel<typeof _modelSchema>

type _country = Expect<Equal<Model['country'], 'AU' | 'CA' | null>>
type _whole = Expect<
  Equal<
    Model['whole'],
    | { readonly id: 1; readonly label: 'A' }
    | { readonly id: 2; readonly label: 'B' }
    | null
  >
>

type _pathCountry = Expect<
  Equal<ModelByPath<typeof _modelSchema, 'country'>, 'AU' | 'CA' | null>
>

type FindCountry = ElementContextByPath<typeof _modelSchema, 'country'>
type _findCountryValue = Expect<Equal<FindCountry['value'], 'AU' | 'CA' | null>>

type _all = _country | _whole | _pathCountry | _findCountryValue
void null as any as _all
