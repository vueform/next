/**
 * Type-level tests for the registry-driven schema typing:
 *
 * - ContextOf wide + TEntry-narrowed
 * - defineSchema acceptance/rejection (items / itemValue / itemLabel /
 *   groupChildren / multiple / translate / languages vs modelValue)
 * - Paths through group / list (flat) / grid nesting
 * - SchemaToModel / ModelByPath
 * - ElementByPath narrowing and unknown-path fallback
 *
 * Run by `pnpm test-dts`.
 */
import {
  defineComputedSchema,
  defineSchema,
  type ContextOf,
  type ElementByPath,
  type GetSchemaEntryByPath,
  type ModelByPath,
  type Paths,
  type SchemaToModel,
} from '@vueform/core'
import { describe, expectTypeOf, test } from 'vitest'
import type { ComputedRef } from 'vue'
import '@vueform/core/components'

type ObjectItems = [{ id: 1; label: 'A' }, { id: 2; label: 'B' }]

describe('ContextOf — wide + narrowed by TEntry', () => {
  test('wide select context exposes props / model / injections and is not any', () => {
    type WideSelect = ContextOf<'VfSelect'>

    expectTypeOf<WideSelect>().not.toBeAny()
    expectTypeOf<WideSelect>().toHaveProperty('props')
    expectTypeOf<WideSelect>().toHaveProperty('model')
    expectTypeOf<WideSelect>().toHaveProperty('$config')
    expectTypeOf<WideSelect>().toHaveProperty('$locale')
    expectTypeOf<WideSelect>().toHaveProperty('$globals')
  })

  // Entry-driven items are widened to primitives (schema items are
  // const-narrowed by defineSchema, so literals must not lock the model)
  test('entry-driven items are widened to primitives', () => {
    type NarrowSelect = ContextOf<
      'VfSelect',
      { items: ObjectItems; itemValue: 'id' }
    >
    expectTypeOf<NarrowSelect['model']>().toEqualTypeOf<number | null>()

    type NarrowMulti = ContextOf<
      'VfSelect',
      { items: ObjectItems; itemValue: 'id'; multiple: true }
    >
    expectTypeOf<NarrowMulti['model']>().toEqualTypeOf<number[]>()

    type NarrowText = ContextOf<
      'VfText',
      { translate: true; languages: { en: 'English'; de: 'German' } }
    >
    expectTypeOf<NonNullable<NarrowText['props']['modelValue']>>().toExtend<{
      en?: any
      de?: any
    }>()
  })

  test('form and addon contexts expose their injections', () => {
    type WideForm = ContextOf<'VfForm'>
    expectTypeOf<WideForm>().toHaveProperty('find')
    expectTypeOf<WideForm>().toHaveProperty('$config')
    expectTypeOf<WideForm>().toHaveProperty('$locale')
    expectTypeOf<WideForm>().toHaveProperty('$globals')

    type WideAddon = ContextOf<'VfAddon'>
    expectTypeOf<WideAddon>().toHaveProperty('$config')
    expectTypeOf<WideAddon>().toHaveProperty('$locale')
    expectTypeOf<WideAddon>().toHaveProperty('$globals')
  })

  // Wide list stays permissive; a schema-narrowed entry types the rows.
  test('list: wide stays permissive, schema-narrowed entry types the rows', () => {
    type WideList = ContextOf<'VfList'>
    expectTypeOf<WideList['model']>().toEqualTypeOf<any[]>()

    type NarrowFlatList = ContextOf<
      'VfList',
      { flat: true; schema: { domain: { type: 'text' } } }
    >
    expectTypeOf<NarrowFlatList['model']>().toEqualTypeOf<
      (string | number | null)[]
    >()
  })

  // Wide grid stays permissive; a grid-schema-narrowed entry types the cells.
  test('grid: wide stays permissive, grid-schema-narrowed entry types the cells', () => {
    type WideGrid = ContextOf<'VfGrid'>
    expectTypeOf<WideGrid['model']>().toEqualTypeOf<Record<string, any>>()

    type NarrowGrid = ContextOf<
      'VfGrid',
      { grid: [[{ type: 'text'; name: 'cell' }]] }
    >
    expectTypeOf<NarrowGrid['model']>().toEqualTypeOf<{
      cell: string | number | null
    }>()
  })

  // Wide matrix stays permissive; rows/cols/mode-narrowed entries type the model.
  test('matrix: wide stays permissive, rows/cols/mode-narrowed entries type the model', () => {
    type WideMatrix = ContextOf<'VfMatrix'>
    expectTypeOf<WideMatrix['model']>().toEqualTypeOf<Record<string, any>>()

    type NarrowMatrix = ContextOf<
      'VfMatrix',
      { mode: 'single'; rows: 2; cols: ['a', 'b'] }
    >
    expectTypeOf<NarrowMatrix['model']>().toEqualTypeOf<(string | null)[]>()
  })
})

// ---------------------------------------------------------------------------
// defineSchema — acceptance (fixtures shared by the sections below)
// ---------------------------------------------------------------------------

const _accepted = defineSchema({
  text: {
    type: 'text',
    label: 'Name',
    default: 'John',
  },
  translated: {
    type: 'text',
    translate: true,
    languages: { en: 'English', de: 'German' },
    default: { en: 'Hello' },
  },
  select: {
    type: 'select',
    items: [
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
    ],
    itemValue: 'id',
    default: 1,
  },
  multi: {
    type: 'select',
    items: ['a', 'b'],
    multiple: true,
    default: ['a'],
  },
  check: {
    type: 'checkbox',
    trueValue: 1,
    falseValue: 0,
    default: 1,
  },
  group: {
    type: 'group',
    schema: {
      nested_text: { type: 'text' },
    },
  },
  nested_group: {
    type: 'group',
    nested: true,
    schema: {
      inner: { type: 'text' },
    },
  },
  list: {
    type: 'list',
    schema: {
      item_text: { type: 'text' },
      item_select: { type: 'select', items: ['x', 'y'] },
    },
  },
  flat_list: {
    type: 'list',
    flat: true,
    wrap: false,
    schema: {
      domain: { type: 'text' },
    },
  },
  grid: {
    type: 'grid',
    cols: 2,
    grid: [
      ['Name', { type: 'text', name: 'cell_text' }],
      ['Choice', { type: 'select', name: 'cell_select', items: ['x', 'y'] }],
    ],
  },
  nested_grid: {
    type: 'grid',
    nested: true,
    grid: [[{ type: 'text', name: 'cell_inner' }]],
  },
  matrix: {
    type: 'matrix',
    rows: ['row_1', 'row_2'],
    cols: [
      { value: 'qty', label: 'Quantity', schema: { type: 'text' } },
      { value: 'note', label: 'Note' },
    ],
  },
  single_matrix: {
    type: 'matrix',
    mode: 'single',
    rows: { row_1: 'Row 1', row_2: 'Row 2' },
    cols: ['col_1', 'col_2'],
  },
  dynamic_matrix: {
    type: 'matrix',
    mode: 'multiple',
    rows: 2,
    cols: ['col_1', 'col_2'],
  },
})

type S = typeof _accepted

const _arrayAccepted = defineSchema([
  { type: 'text', name: 'first' },
  { type: 'select', name: 'second', items: ['a', 'b'] },
])

type AS = typeof _arrayAccepted

// Getter form: wraps the getter in a computed with the same const-narrowing.
const _computedAccepted = defineComputedSchema(() => ({
  text: { type: 'text', default: 'John' },
  select: {
    type: 'select',
    items: [
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
    ],
    itemValue: 'id',
  },
}))

type CS = typeof _computedAccepted.value

describe('defineSchema — acceptance', () => {
  test('getter form wraps the schema in a computed with the same const-narrowing', () => {
    expectTypeOf<typeof _computedAccepted>().toExtend<ComputedRef<any>>()
    expectTypeOf<SchemaToModel<CS>>().toEqualTypeOf<{
      text: string | number | null
      select: number | null
    }>()
  })
})

describe('defineSchema — rejection', () => {
  test('select default must match the item value primitive', () => {
    // The getter form validates the getter's return like the object form.
    defineComputedSchema(() => ({
      bad_fn_select: {
        type: 'select',
        items: [
          { id: 1, label: 'A' },
          { id: 2, label: 'B' },
        ],
        itemValue: 'id',
        // @ts-expect-error — default must match the item `id` primitive (number)
        default: 'A',
      },
    }))

    defineSchema({
      bad_select: {
        type: 'select',
        items: [
          { id: 1, label: 'A' },
          { id: 2, label: 'B' },
        ],
        itemValue: 'id',
        // @ts-expect-error — default must match the item `id` primitive (number)
        default: 'A',
      },
    })
  })

  test('itemValue must be a key of the item', () => {
    defineSchema({
      bad_item_value: {
        type: 'select',
        items: [
          { id: 1, label: 'A' },
          { id: 2, label: 'B' },
        ],
        // @ts-expect-error — itemValue must be a key of the item
        itemValue: 'idf',
      },
    })

    defineComputedSchema(() => ({
      bad_fn_item_value: {
        type: 'select',
        items: [
          { id: 1, label: 'A' },
          { id: 2, label: 'B' },
        ],
        // @ts-expect-error — itemValue must be a key of the item
        itemValue: 'idf',
      },
    }))
  })

  test('multiple select requires an array model', () => {
    defineSchema({
      bad_multi: {
        type: 'select',
        items: ['a', 'b'],
        multiple: true,
        // @ts-expect-error — multiple select requires an array model
        default: 'a',
      },
    })
  })

  test('translate: true requires a locale-keyed object model', () => {
    defineSchema({
      bad_translate: {
        type: 'text',
        translate: true,
        // @ts-expect-error — translate: true requires a locale-keyed object model
        default: 'plain string',
      },
    })
  })

  test('checkbox model must be trueValue | falseValue', () => {
    defineSchema({
      bad_checkbox: {
        type: 'checkbox',
        trueValue: 1,
        falseValue: 0,
        // @ts-expect-error — model must be trueValue | falseValue (1 | 0)
        default: 2,
      },
    })
  })

  test('nested entries are validated recursively', () => {
    defineSchema({
      bad_nested: {
        type: 'group',
        schema: {
          inner_select: {
            type: 'select',
            items: [{ id: 1 }, { id: 2 }],
            itemValue: 'id',
            // @ts-expect-error — nested entries are validated recursively
            default: 'x',
          },
        },
      },
    })
  })

  test('group modelValue must match the child schema', () => {
    defineSchema({
      bad_group_model: {
        type: 'group',
        modelValue: {
          // @ts-expect-error — non-nested group model must match child schema (number | null)
          select: 'foo',
        },
        schema: {
          select: { type: 'select', items: [1, 2, 3] },
        },
      },
    })

    defineSchema({
      good_group_model: {
        type: 'group',
        modelValue: {
          select: 1,
        },
        schema: {
          select: { type: 'select', items: [1, 2, 3] },
        },
      },
    })

    defineSchema({
      bad_nested_group_model: {
        type: 'group',
        nested: true,
        modelValue: {
          // @ts-expect-error — nested group model must match child schema (number | null)
          select: 'foo',
        },
        schema: {
          select: { type: 'select', items: [1, 2, 3] },
        },
      },
    })

    defineSchema({
      good_nested_group_model: {
        type: 'group',
        nested: true,
        modelValue: {
          select: 1,
        },
        schema: {
          select: { type: 'select', items: [1, 2, 3] },
        },
      },
    })
  })

  test('list modelValue rows must match the child schema', () => {
    defineSchema({
      bad_list_model: {
        type: 'list',
        // @ts-expect-error — non-flat list rows must be objects matching the child schema
        modelValue: ['nope'],
        schema: {
          item_text: { type: 'text' },
        },
      },
    })

    defineSchema({
      bad_list_row_model: {
        type: 'list',
        modelValue: [
          {
            // @ts-expect-error — row values must match the child schema (string | number | null)
            item_text: true,
          },
        ],
        schema: {
          item_text: { type: 'text' },
        },
      },
    })

    defineSchema({
      good_list_model: {
        type: 'list',
        modelValue: [{ item_text: 'a', item_select: 'x' }],
        default: [{ item_text: 'b', item_select: 'y' }],
        schema: {
          item_text: { type: 'text' },
          item_select: { type: 'select', items: ['x', 'y'] },
        },
      },
    })
  })

  test('flat list rows must match the single child element model', () => {
    defineSchema({
      bad_flat_list_model: {
        type: 'list',
        flat: true,
        // @ts-expect-error — flat list rows must match the single child element's model
        default: [true],
        schema: {
          domain: { type: 'text' },
        },
      },
    })

    defineSchema({
      good_flat_list_model: {
        type: 'list',
        flat: true,
        modelValue: ['a'],
        default: ['b'],
        schema: {
          domain: { type: 'text' },
        },
      },
    })
  })

  test('grid modelValue must match its named cell elements', () => {
    defineSchema({
      bad_grid_model: {
        type: 'grid',
        modelValue: {
          // @ts-expect-error — grid model must match its named cell elements (string | number | null)
          cell: true,
        },
        grid: [[{ type: 'text', name: 'cell' }]],
      },
    })

    defineSchema({
      good_grid_model: {
        type: 'grid',
        modelValue: {
          cell: 'a',
        },
        grid: [[{ type: 'text', name: 'cell' }]],
      },
    })

    defineSchema({
      good_nested_grid_model: {
        type: 'grid',
        nested: true,
        modelValue: {
          cell: 'a',
        },
        grid: [[{ type: 'text', name: 'cell' }]],
      },
    })
  })

  test('matrix model must match its rows/cols/mode shape', () => {
    defineSchema({
      bad_matrix_single: {
        type: 'matrix',
        mode: 'single',
        rows: ['row_1'],
        cols: ['a', 'b'],
        modelValue: {
          // @ts-expect-error — single mode rows hold one widened col value (string | null)
          row_1: 5,
        },
      },
    })

    defineSchema({
      bad_matrix_multiple: {
        type: 'matrix',
        mode: 'multiple',
        rows: ['row_1'],
        cols: ['a', 'b'],
        default: {
          // @ts-expect-error — multiple mode rows hold arrays of widened col values
          row_1: 'a',
        },
      },
    })

    defineSchema({
      good_matrix_static: {
        type: 'matrix',
        mode: 'multiple',
        rows: ['row_1', 'row_2'],
        cols: ['a', 'b'],
        default: {
          row_1: ['a'],
          row_2: [],
        },
      },
    })

    defineSchema({
      good_matrix_dynamic: {
        type: 'matrix',
        mode: 'single',
        rows: 2,
        cols: ['a', 'b'],
        default: ['a', null],
      },
    })
  })
})

describe('Paths', () => {
  type P = Paths<S>

  test('paths resolve through group / list / grid nesting', () => {
    expectTypeOf<'text'>().toExtend<P>()
    expectTypeOf<'group.nested_text'>().toExtend<P>()
    expectTypeOf<'nested_group.inner'>().toExtend<P>()
    expectTypeOf<'list.0'>().toExtend<P>()
    // Paths suggests the literal `0` index only (template-literal types never
    // show in completions); other indices still resolve via ElementByPath.
    expectTypeOf<'list.0.item_text'>().toExtend<P>()
    expectTypeOf<'list.3.item_text'>().not.toExtend<P>()
    expectTypeOf<'flat_list.0'>().toExtend<P>()
    expectTypeOf<'grid.cell_text'>().toExtend<P>()
    expectTypeOf<'nested_grid.cell_inner'>().toExtend<P>()
    expectTypeOf<'bogus'>().not.toExtend<P>()
  })

  // Array defaults are const-narrowed to readonly tuples by defineSchema — if
  // the model constraint rejects them, inference falls back to the wide
  // `(ObjectSchema | ArraySchema) & …` constraint and Array prototype keys leak
  // into Paths (i.e. `find()` suggestions).
  test('Array prototype keys do not leak into Paths', () => {
    expectTypeOf<'concat'>().not.toExtend<P>()
    expectTypeOf<'entries'>().not.toExtend<P>()
  })

  test('array-form schemas resolve named entry paths', () => {
    type AP = Paths<AS>

    expectTypeOf<'first'>().toExtend<AP>()
    expectTypeOf<'second'>().toExtend<AP>()
  })
})

describe('SchemaToModel / ModelByPath', () => {
  type M = SchemaToModel<S>

  test('leaf entries map to their widened models', () => {
    expectTypeOf<M['text']>().toEqualTypeOf<string | number | null>()
    expectTypeOf<M['select']>().toEqualTypeOf<number | null>()
    expectTypeOf<M['multi']>().toEqualTypeOf<string[]>()
    expectTypeOf<M['check']>().toEqualTypeOf<1 | 0>()
  })

  test('container entries shape the model by nesting', () => {
    // Non-nested group children merge into the parent model.
    expectTypeOf<M['nested_text']>().toEqualTypeOf<string | number | null>()
    expectTypeOf<M['nested_group']>().toEqualTypeOf<{
      inner: string | number | null
    }>()
    expectTypeOf<M['list']>().toEqualTypeOf<
      { item_text: string | number | null; item_select: string | null }[]
    >()
    expectTypeOf<M['flat_list']>().toEqualTypeOf<(string | number | null)[]>()
    // Non-nested grid children merge into the parent model.
    expectTypeOf<M['cell_text']>().toEqualTypeOf<string | number | null>()
    expectTypeOf<M['cell_select']>().toEqualTypeOf<string | null>()
    expectTypeOf<M['nested_grid']>().toEqualTypeOf<{
      cell_inner: string | number | null
    }>()
  })

  test('matrix entries shape the model by rows/cols/mode', () => {
    // Auto matrix: literal row keys, cells typed via col `schema` (or `any`).
    expectTypeOf<M['matrix']>().toEqualTypeOf<{
      row_1: { qty: string | number | null; note: any }
      row_2: { qty: string | number | null; note: any }
    }>()
    // Single mode: one widened col value per row (record rows key the model).
    expectTypeOf<M['single_matrix']>().toEqualTypeOf<{
      row_1: string | null
      row_2: string | null
    }>()
    // Dynamic multiple mode: array of col value arrays.
    expectTypeOf<M['dynamic_matrix']>().toEqualTypeOf<string[][]>()
  })

  test('ModelByPath resolves nested paths and falls back to any', () => {
    expectTypeOf<ModelByPath<S, 'select'>>().toEqualTypeOf<number | null>()
    expectTypeOf<ModelByPath<S, 'list.0.item_text'>>().toEqualTypeOf<
      string | number | null
    >()
    expectTypeOf<ModelByPath<S, 'list.0'>>().toEqualTypeOf<{
      item_text: string | number | null
      item_select: string | null
    }>()
    expectTypeOf<ModelByPath<S, 'flat_list.0'>>().toEqualTypeOf<
      string | number | null
    >()
    expectTypeOf<ModelByPath<S, 'grid.cell_select'>>().toEqualTypeOf<
      string | null
    >()
    expectTypeOf<ModelByPath<S, 'bogus'>>().toBeAny()
  })
})

describe('ElementByPath — narrowed contexts + fallbacks', () => {
  test('leaf elements expose narrowed model and update', () => {
    type FoundSelect = ElementByPath<S, 'select'>
    expectTypeOf<FoundSelect['model']>().toEqualTypeOf<number | null>()
    expectTypeOf<Parameters<FoundSelect['update']>[0]>().toEqualTypeOf<
      number | null
    >()

    type FoundText = ElementByPath<S, 'text'>
    expectTypeOf<FoundText['model']>().toEqualTypeOf<string | number | null>()

    type FoundListChild = ElementByPath<S, 'list.2.item_select'>
    expectTypeOf<FoundListChild['model']>().toEqualTypeOf<string | null>()
  })

  test('group contexts expose models shaped by their child schema', () => {
    // Non-nested group context exposes the scoped projection of its child schema.
    type FoundGroup = ElementByPath<S, 'group'>
    expectTypeOf<FoundGroup['model']>().toEqualTypeOf<{
      nested_text: string | number | null
    }>()

    // Nested group context exposes a model shaped by its child schema.
    type FoundNestedGroup = ElementByPath<S, 'nested_group'>
    expectTypeOf<FoundNestedGroup['model']>().toEqualTypeOf<{
      inner: string | number | null
    }>()
    expectTypeOf<FoundNestedGroup['model']['inner']>().toEqualTypeOf<
      string | number | null
    >()
  })

  test('list contexts expose a rows-array model shaped by their schema + flat prop', () => {
    type FoundList = ElementByPath<S, 'list'>
    expectTypeOf<FoundList['model']>().toEqualTypeOf<
      { item_text: string | number | null; item_select: string | null }[]
    >()

    type FoundFlatList = ElementByPath<S, 'flat_list'>
    expectTypeOf<FoundFlatList['model']>().toEqualTypeOf<
      (string | number | null)[]
    >()

    // Non-flat list rows resolve to the synthetic group prototype.
    type FoundListRow = ElementByPath<S, 'list.1'>
    expectTypeOf<FoundListRow['props']['type']>().toEqualTypeOf<
      'group' | undefined
    >()
  })

  test('grid contexts expose the scoped projection of their named cell elements', () => {
    type FoundGrid = ElementByPath<S, 'grid'>
    expectTypeOf<FoundGrid['model']>().toEqualTypeOf<{
      cell_text: string | number | null
      cell_select: string | null
    }>()

    type FoundNestedGrid = ElementByPath<S, 'nested_grid'>
    expectTypeOf<FoundNestedGrid['model']>().toEqualTypeOf<{
      cell_inner: string | number | null
    }>()

    type FoundGridChild = ElementByPath<S, 'grid.cell_text'>
    expectTypeOf<FoundGridChild['model']>().toEqualTypeOf<
      string | number | null
    >()
  })

  test('matrix context exposes a rows/cols/mode-shaped model', () => {
    type FoundMatrix = ElementByPath<S, 'matrix'>
    expectTypeOf<FoundMatrix['model']>().toEqualTypeOf<{
      row_1: { qty: string | number | null; note: any }
      row_2: { qty: string | number | null; note: any }
    }>()
  })

  test('unknown paths fall back to any', () => {
    type FoundUnknown = ElementByPath<S, 'bogus'>
    expectTypeOf<FoundUnknown>().toBeAny()
  })
})

describe('GetSchemaEntryByPath', () => {
  test('resolves the literal entry for a path', () => {
    type EntrySelect = GetSchemaEntryByPath<S, 'select'>
    expectTypeOf<EntrySelect['type']>().toEqualTypeOf<'select'>()
    expectTypeOf<EntrySelect['itemValue']>().toEqualTypeOf<'id'>()
  })
})
