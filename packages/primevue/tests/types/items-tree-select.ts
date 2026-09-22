/*
 * Compile-time assertions for PrimeVue VfTreeSelect options → selection-keys
 * model inference (shaped by selectionMode).
 */
import {
  defineSchema,
  type ElementContextByPath,
  type ModelByPath,
  type SchemaToModel,
} from '@vueform/core'
import '@/components/VfTreeSelect/unstyled'

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false
type Expect<T extends true> = T

const treeOptions = [
  {
    key: 'documents',
    label: 'Documents',
    children: [
      {
        key: 'reports',
        label: 'Reports',
        children: [
          { key: 'annual', label: 'Annual Report' },
          { key: 'q4', label: 'Q4 Summary' },
        ],
      },
    ],
  },
  {
    key: 'media',
    label: 'Media',
    children: [{ key: 'photos', label: 'Photos' }],
  },
] as const

type TreeKeys = 'documents' | 'reports' | 'annual' | 'q4' | 'media' | 'photos'

// single / multiple / unset → { [key]?: true }
defineSchema({
  bad: {
    type: 'tree-select',
    options: treeOptions,
    selectionMode: 'single',
    // @ts-expect-error string is not a keys map
    modelValue: 'documents',
  },
  good: {
    type: 'tree-select',
    options: treeOptions,
    selectionMode: 'single',
    modelValue: { documents: true },
  },
  goodMulti: {
    type: 'tree-select',
    options: treeOptions,
    selectionMode: 'multiple',
    modelValue: { documents: true, annual: true },
  },
  goodEmpty: {
    type: 'tree-select',
    options: treeOptions,
    modelValue: {},
  },
  badKey: {
    type: 'tree-select',
    options: treeOptions,
    // @ts-expect-error unknown key
    modelValue: { nope: true },
  },
})

// checkbox → { [key]?: { checked; partialChecked } }
defineSchema({
  bad: {
    type: 'tree-select',
    options: treeOptions,
    selectionMode: 'checkbox',
    // @ts-expect-error true is not checkbox meta
    modelValue: { documents: true },
  },
  good: {
    type: 'tree-select',
    options: treeOptions,
    selectionMode: 'checkbox',
    modelValue: {
      documents: { checked: true, partialChecked: false },
      reports: { checked: false, partialChecked: true },
    },
  },
})

const _modelSchema = defineSchema({
  single: {
    type: 'tree-select',
    options: treeOptions,
    selectionMode: 'single',
  },
  checkbox: {
    type: 'tree-select',
    options: treeOptions,
    selectionMode: 'checkbox',
  },
})

type Model = SchemaToModel<typeof _modelSchema>

type _single = Expect<Equal<Model['single'], Partial<Record<TreeKeys, true>>>>
type _checkbox = Expect<
  Equal<
    Model['checkbox'],
    Partial<Record<TreeKeys, { checked: boolean; partialChecked: boolean }>>
  >
>

type _pathSingle = Expect<
  Equal<
    ModelByPath<typeof _modelSchema, 'single'>,
    Partial<Record<TreeKeys, true>>
  >
>

type FindSingle = ElementContextByPath<typeof _modelSchema, 'single'>
type _findSingleValue = Expect<
  Equal<FindSingle['value'], Partial<Record<TreeKeys, true>>>
>

type _all = _single | _checkbox | _pathSingle | _findSingleValue
void null as any as _all
