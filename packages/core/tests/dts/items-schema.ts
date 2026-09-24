/*
 * Compile-time assertions for defineSchema items → modelValue inference and
 * SchemaToModel / ModelByPath derivation from items.
 * Not imported at runtime; vue-tsc / tsc validates it.
 */
import { defineSchema, type ElementByPath, type ModelByPath, type SchemaToModel } from '@vueform/core'

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false
type Expect<T extends true> = T

// Scalar number items — modelValue must be number | null
defineSchema({
  bad: {
    type: 'select',
    items: [1, 2, 3],
    // @ts-expect-error string model with number items
    modelValue: 'foo',
  },
  good: {
    type: 'select',
    items: [1, 2, 3],
    modelValue: 1,
  },
  goodNull: {
    type: 'select',
    items: [1, 2, 3],
    modelValue: null,
  },
})

// Scalar string items
defineSchema({
  bad: {
    type: 'select',
    items: ['x', 'y'],
    // @ts-expect-error number model with string items
    modelValue: 123,
  },
  good: {
    type: 'select',
    items: ['x', 'y'],
    modelValue: 'x',
  },
})

// Object items + itemValue key
defineSchema({
  bad: {
    type: 'select',
    items: [
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
    ],
    itemValue: 'id',
    // @ts-expect-error label string is not the value key
    modelValue: 'A',
  },
  good: {
    type: 'select',
    items: [
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
    ],
    itemValue: 'id',
    modelValue: 1,
  },
})

// Object items — item-key props must be keys of the item shape
defineSchema({
  badValue: {
    type: 'select',
    items: [
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
    ],
    // @ts-expect-error 'idf' is not a key of the item
    itemValue: 'idf',
  },
  badLabel: {
    type: 'select',
    items: [
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
    ],
    // @ts-expect-error 'title' is not a key of the item
    itemLabel: 'title',
  },
  goodKeys: {
    type: 'select',
    items: [
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
    ],
    itemValue: 'id',
    itemLabel: 'label',
  },
})

// Key props are forbidden on scalar arrays and record maps
defineSchema({
  badScalar: {
    type: 'select',
    items: [1, 2, 3],
    // @ts-expect-error key props are not allowed for scalar items
    itemValue: 'id',
  },
  badRecord: {
    type: 'select',
    items: { us: 'United States', de: 'Germany' },
    // @ts-expect-error key props are not allowed for record-map items
    itemValue: 'us',
  },
})

// groupChildren must be a key of the group object
defineSchema({
  badGroup: {
    type: 'select',
    items: [{ label: 'G', children: [{ id: 1, name: 'A' }] }],
    // @ts-expect-error 'kidz' is not a key of the group
    groupChildren: 'kidz',
  },
  goodGroup: {
    type: 'select',
    items: [{ label: 'G', children: [{ id: 1, name: 'A' }] }],
    groupChildren: 'children',
    itemValue: 'id',
    itemLabel: 'name',
  },
})

// Array notation and radios share the same item-key check
defineSchema([
  {
    name: 'country',
    type: 'select',
    items: [
      { id: 'us', name: 'United States' },
      { id: 'de', name: 'Germany' },
    ],
    // @ts-expect-error 'idf' is not a key of the item
    itemValue: 'idf',
  },
])

defineSchema({
  badRadios: {
    type: 'radios',
    items: [
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
    ],
    // @ts-expect-error 'nope' is not a key of the item
    itemValue: 'nope',
  },
})

// Object items without itemValue — whole object is the model
defineSchema({
  good: {
    type: 'select',
    items: [
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
    ],
    modelValue: { id: 1, label: 'A' },
  },
})

// multiple: true → array model
defineSchema({
  bad: {
    type: 'select',
    items: [1, 2, 3],
    multiple: true,
    // @ts-expect-error single value when multiple
    modelValue: 1,
  },
  good: {
    type: 'select',
    items: [1, 2, 3],
    multiple: true,
    modelValue: [1, 2],
  },
})

// radios — always single (Value | null)
defineSchema({
  bad: {
    type: 'radios',
    items: [1, 2, 3] as const,
    // @ts-expect-error string model with number items
    modelValue: 'foo',
  },
  badArray: {
    type: 'radios',
    items: [1, 2, 3] as const,
    // @ts-expect-error array model on single-select radios
    modelValue: [1],
  },
  good: {
    type: 'radios',
    items: [1, 2, 3] as const,
    modelValue: 1,
  },
  goodNull: {
    type: 'radios',
    items: [1, 2, 3] as const,
    modelValue: null,
  },
})

// checkboxes — always multi (Value[])
defineSchema({
  bad: {
    type: 'checkboxes',
    items: [1, 2, 3] as const,
    // @ts-expect-error single value when multi checkboxes
    modelValue: 1,
  },
  badString: {
    type: 'checkboxes',
    items: [1, 2, 3] as const,
    // @ts-expect-error string array with number items
    modelValue: ['foo'],
  },
  good: {
    type: 'checkboxes',
    items: [1, 2, 3] as const,
    modelValue: [1, 2],
  },
  goodEmpty: {
    type: 'checkboxes',
    items: [1, 2, 3] as const,
    modelValue: [],
  },
})

// default is constrained the same way
defineSchema({
  bad: {
    type: 'select',
    items: [1, 2, 3],
    // @ts-expect-error string default with number items
    default: 'foo',
  },
  good: {
    type: 'select',
    items: [1, 2, 3],
    default: 2,
  },
})

// Record map items — model is key type
defineSchema({
  bad: {
    type: 'select',
    items: { us: 'United States', de: 'Germany' },
    // @ts-expect-error value is not a key
    modelValue: 'United States',
  },
  good: {
    type: 'select',
    items: { us: 'United States', de: 'Germany' },
    modelValue: 'us',
  },
})

// itemValue mapper return drives model
defineSchema({
  bad: {
    type: 'select',
    items: [
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
    ],
    itemValue: (item: { id: number; label: string }) => item.id,
    // @ts-expect-error mapper returns number
    modelValue: 'A',
  },
  good: {
    type: 'select',
    items: [
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
    ],
    itemValue: (item: { id: number; label: string }) => item.id,
    modelValue: 1,
  },
})

// Endpoint URL items — model stays loose
defineSchema({
  select: {
    type: 'select',
    items: '/api/items',
    modelValue: 'anything',
  },
})

// Non-items elements are unaffected
defineSchema({
  text: {
    type: 'text',
    modelValue: 'anything',
  },
  agree: {
    type: 'checkbox',
  },
})

// Array schema notation
defineSchema([
  {
    name: 'select',
    type: 'select',
    items: [1, 2, 3],
    // @ts-expect-error string model with number items
    modelValue: 'foo',
  },
  {
    name: 'ok',
    type: 'select',
    items: [1, 2, 3],
    modelValue: 1,
  },
] as const)

// Preserve literal schema type on return
const schema = defineSchema({
  select: {
    type: 'select',
    items: [1, 2, 3] as const,
    modelValue: 1 as const,
  },
})

const _assertReturn: Equal<(typeof schema)['select']['items'], readonly [1, 2, 3]> = true
void _assertReturn
void schema

// =============================================================================
// SchemaToModel / ModelByPath
// =============================================================================

const modelSchema = defineSchema({
  nums: {
    type: 'select',
    items: [1, 2, 3] as const,
  },
  strs: {
    type: 'select',
    items: ['x', 'y'] as const,
  },
  objs: {
    type: 'select',
    items: [
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
    ] as const,
    itemValue: 'id' as const,
  },
  whole: {
    type: 'select',
    items: [
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
    ] as const,
  },
  multi: {
    type: 'select',
    items: [1, 2, 3] as const,
    multiple: true as const,
  },
  map: {
    type: 'select',
    items: { us: 'United States', de: 'Germany' } as const,
  },
  endpoint: {
    type: 'select',
    items: '/api/items',
  },
  name: {
    type: 'text',
  },
  radios: {
    type: 'radios',
    items: [1, 2, 3] as const,
  },
  checkboxes: {
    type: 'checkboxes',
    items: [1, 2, 3] as const,
  },
  radiosObjs: {
    type: 'radios',
    items: [
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
    ] as const,
    itemValue: 'id' as const,
  },
  checkboxesObjs: {
    type: 'checkboxes',
    items: [
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
    ] as const,
    itemValue: 'id' as const,
  },
})

type Model = SchemaToModel<typeof modelSchema>

// Schema items are widened to primitives — literals must not lock the model
// (defineSchema's `const` type parameter narrows every items array).
type _nums = Expect<Equal<Model['nums'], number | null>>
type _strs = Expect<Equal<Model['strs'], string | null>>
type _objs = Expect<Equal<Model['objs'], number | null>>
type _whole = Expect<Equal<Model['whole'], { id: number; label: string } | null>>
type _multi = Expect<Equal<Model['multi'], number[]>>
// Record-map keys are structural (not const-narrowing artifacts), so they stay literal
type _map = Expect<Equal<Model['map'], 'us' | 'de' | null>>
type _endpoint = Expect<Equal<Model['endpoint'], any>>
// VfText without `translate` narrows to the plain scalar model
type _name = Expect<Equal<Model['name'], string | number | null>>
type _radios = Expect<Equal<Model['radios'], number | null>>
type _checkboxes = Expect<Equal<Model['checkboxes'], number[]>>
type _radiosObjs = Expect<Equal<Model['radiosObjs'], number | null>>
type _checkboxesObjs = Expect<Equal<Model['checkboxesObjs'], number[]>>

type _pathNums = Expect<Equal<ModelByPath<typeof modelSchema, 'nums'>, number | null>>
type _pathObjs = Expect<Equal<ModelByPath<typeof modelSchema, 'objs'>, number | null>>
type _pathMulti = Expect<Equal<ModelByPath<typeof modelSchema, 'multi'>, number[]>>
type _pathName = Expect<Equal<ModelByPath<typeof modelSchema, 'name'>, string | number | null>>
type _pathRadios = Expect<Equal<ModelByPath<typeof modelSchema, 'radios'>, number | null>>
type _pathCheckboxes = Expect<Equal<ModelByPath<typeof modelSchema, 'checkboxes'>, number[]>>

// form$.find / ElementByPath narrows value/model/update from the entry
type FindNums = ElementByPath<typeof modelSchema, 'nums'>
type FindObjs = ElementByPath<typeof modelSchema, 'objs'>
type FindMulti = ElementByPath<typeof modelSchema, 'multi'>
type FindRadios = ElementByPath<typeof modelSchema, 'radios'>
type FindCheckboxes = ElementByPath<typeof modelSchema, 'checkboxes'>

type _findNumsValue = Expect<Equal<FindNums['value'], number | null>>
type _findNumsModel = Expect<Equal<FindNums['model'], number | null>>
type _findNumsUpdate = Expect<Equal<Parameters<FindNums['update']>[0], number | null>>
type _findObjsValue = Expect<Equal<FindObjs['value'], number | null>>
type _findMultiValue = Expect<Equal<FindMulti['value'], number[]>>
type _findRadiosValue = Expect<Equal<FindRadios['value'], number | null>>
type _findCheckboxesValue = Expect<Equal<FindCheckboxes['value'], number[]>>

// form$.find also overlays resolved items/groups from the schema items shape
type _findNumsItemValue = Expect<Equal<FindNums['items'][number]['value'], number>>
type _findObjsItemValue = Expect<Equal<FindObjs['items'][number]['value'], number>>
type _findRadiosItemValue = Expect<Equal<FindRadios['items'][number]['value'], number>>
type _findCheckboxesItemValue = Expect<Equal<FindCheckboxes['items'][number]['value'], number>>

// Non-model elements (button) must not gain value/model/load/update from the overlay

const buttonSchema = defineSchema({
  button: { type: 'button' },
  select: { type: 'select', items: [1, 2, 3] as const },
})
type FindButton = ElementByPath<typeof buttonSchema, 'button'>
type _buttonNoValue = Expect<'value' extends keyof FindButton ? false : true>
type _buttonNoModel = Expect<'model' extends keyof FindButton ? false : true>
type _buttonNoLoad = Expect<'load' extends keyof FindButton ? false : true>
type _buttonNoUpdate = Expect<'update' extends keyof FindButton ? false : true>
type _buttonHasFire = Expect<'fire' extends keyof FindButton ? true : false>

type _all =
  | _nums
  | _strs
  | _objs
  | _whole
  | _multi
  | _map
  | _endpoint
  | _name
  | _radios
  | _checkboxes
  | _radiosObjs
  | _checkboxesObjs
  | _pathNums
  | _pathObjs
  | _pathMulti
  | _pathName
  | _pathRadios
  | _pathCheckboxes
  | _findNumsValue
  | _findNumsModel
  | _findNumsUpdate
  | _findObjsValue
  | _findMultiValue
  | _findRadiosValue
  | _findCheckboxesValue
  | _findNumsItemValue
  | _findObjsItemValue
  | _findRadiosItemValue
  | _findCheckboxesItemValue
  | _buttonNoValue
  | _buttonNoModel
  | _buttonNoLoad
  | _buttonNoUpdate
  | _buttonHasFire
void null as any as _all

// ============ Schema onChange el$ typing (VfSelect pilot) ============
// The select definition's events are VfSelectEmits, so `el$` in schema
// on* handlers gets the full blueprint-derived NewContextOf<'VfSelect'> via
// discriminated-union contextual typing — while items→model validation
// (asserted above) keeps working.

defineSchema({
  eventSelect: {
    type: 'select',
    items: [
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
    ],
    itemValue: 'id',
    onChange(_n, _o, el$) {
      const path: string = el$.path
      void path
      void el$.validate
      void el$.items
      void el$.model
      void el$.form$
      // @ts-expect-error unknown key must error on the full context
      void el$.definitelyNotARealProp
    },
  },
})
