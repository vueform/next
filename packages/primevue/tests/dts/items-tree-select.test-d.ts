/*
 * Compile-time assertions for PrimeVue VfTreeSelect options → selection-keys
 * model inference (shaped by selectionMode).
 * Run by `pnpm test:dts`.
 */
import {
  defineSchema,
  type ElementByPath,
  type ModelByPath,
  type SchemaToModel,
} from '@vueform/core'
import { describe, expectTypeOf, test } from 'vitest'
import '@vueform/primevue/components/VfTreeSelect/unstyled'

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

describe('VfTreeSelect options → selection-keys model inference', () => {
  test('single / multiple / unset → { [key]?: true }', () => {
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
  })

  test('checkbox → { [key]?: { checked; partialChecked } }', () => {
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
  })
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

describe('SchemaToModel', () => {
  test('shapes the model by selectionMode', () => {
    expectTypeOf<Model['single']>().toEqualTypeOf<
      Partial<Record<TreeKeys, true>>
    >()
    expectTypeOf<Model['checkbox']>().toEqualTypeOf<
      Partial<Record<TreeKeys, { checked: boolean; partialChecked: boolean }>>
    >()
  })
})

describe('ModelByPath', () => {
  test('derives the selection-keys model for a path', () => {
    expectTypeOf<ModelByPath<typeof _modelSchema, 'single'>>().toEqualTypeOf<
      Partial<Record<TreeKeys, true>>
    >()
  })
})

describe('ElementByPath (form$.find)', () => {
  test('narrows value from the entry', () => {
    type FindSingle = ElementByPath<typeof _modelSchema, 'single'>

    expectTypeOf<FindSingle['value']>().toEqualTypeOf<
      Partial<Record<TreeKeys, true>>
    >()
  })
})
