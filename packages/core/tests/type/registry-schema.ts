/*
 * Compile-time assertions for the registry-driven schema typing:
 *
 * - ContextOf wide + TEntry-narrowed
 * - defineSchema acceptance/rejection (items / itemValue / itemLabel /
 *   groupChildren / multiple / translate / languages vs modelValue)
 * - Paths through group / list (flat) / grid nesting
 * - SchemaToModel / ModelByPath
 * - ElementByPath narrowing and unknown-path fallback
 *
 * Validated by `pnpm tsc:types`.
 */
import { defineComputedSchema, defineSchema, type ContextOf, type ElementByPath, type GetSchemaEntryByPath, type ModelByPath, type Paths, type SchemaToModel } from '@vueform/core'
import type { ComputedRef } from 'vue'
import '@vueform/core/components'

type Expect<T extends true> = T
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false
type IsAny<T> = 0 extends 1 & T ? true : false
type HasKey<T, K extends string> = K extends keyof T ? true : false

type ObjectItems = [{ id: 1; label: 'A' }, { id: 2; label: 'B' }]

// ---------------------------------------------------------------------------
// ContextOf — wide + narrowed by TEntry
// ---------------------------------------------------------------------------

type WideSelect = ContextOf<'VfSelect'>
type _wideNotAny = Expect<IsAny<WideSelect> extends false ? true : false>
type _wideHasProps = Expect<HasKey<WideSelect, 'props'>>
type _wideHasModel = Expect<HasKey<WideSelect, 'model'>>
type _wideHasConfig = Expect<HasKey<WideSelect, '$config'>>
type _wideHasLocale = Expect<HasKey<WideSelect, '$locale'>>
type _wideHasGlobals = Expect<HasKey<WideSelect, '$globals'>>

// Entry-driven items are widened to primitives (schema items are
// const-narrowed by defineSchema, so literals must not lock the model)
type NarrowSelect = ContextOf<'VfSelect', { items: ObjectItems; itemValue: 'id' }>
type _narrowModel = Expect<Equal<NarrowSelect['model'], number | null>>

type NarrowMulti = ContextOf<'VfSelect', { items: ObjectItems; itemValue: 'id'; multiple: true }>
type _narrowMultiModel = Expect<Equal<NarrowMulti['model'], number[]>>

type NarrowText = ContextOf<'VfText', { translate: true; languages: { en: 'English'; de: 'German' } }>
type _textModelKeys = Expect<NonNullable<NarrowText['props']['modelValue']> extends { en?: any; de?: any } ? true : false>

type WideForm = ContextOf<'VfForm'>
type _formHasFind = Expect<HasKey<WideForm, 'find'>>
type _formHasConfig = Expect<HasKey<WideForm, '$config'>>
type _formHasLocale = Expect<HasKey<WideForm, '$locale'>>
type _formHasGlobals = Expect<HasKey<WideForm, '$globals'>>

type WideAddon = ContextOf<'VfAddon'>
type _addonHasConfig = Expect<HasKey<WideAddon, '$config'>>
type _addonHasLocale = Expect<HasKey<WideAddon, '$locale'>>
type _addonHasGlobals = Expect<HasKey<WideAddon, '$globals'>>

// Wide list stays permissive; a schema-narrowed entry types the rows.
type WideList = ContextOf<'VfList'>
type _wideListModel = Expect<Equal<WideList['model'], any[]>>

type NarrowFlatList = ContextOf<'VfList', { flat: true; schema: { domain: { type: 'text' } } }>
type _narrowFlatListModel = Expect<Equal<NarrowFlatList['model'], (string | number | null)[]>>

// Wide grid stays permissive; a grid-schema-narrowed entry types the cells.
type WideGrid = ContextOf<'VfGrid'>
type _wideGridModel = Expect<Equal<WideGrid['model'], Record<string, any>>>

type NarrowGrid = ContextOf<'VfGrid', { grid: [[{ type: 'text'; name: 'cell' }]] }>
type _narrowGridModel = Expect<Equal<NarrowGrid['model'], { cell: string | number | null }>>

// Wide matrix stays permissive; rows/cols/mode-narrowed entries type the model.
type WideMatrix = ContextOf<'VfMatrix'>
type _wideMatrixModel = Expect<Equal<WideMatrix['model'], Record<string, any>>>

type NarrowMatrix = ContextOf<'VfMatrix', { mode: 'single'; rows: 2; cols: ['a', 'b'] }>
type _narrowMatrixModel = Expect<Equal<NarrowMatrix['model'], (string | null)[]>>

// ---------------------------------------------------------------------------
// defineSchema — acceptance
// ---------------------------------------------------------------------------

// eslint-disable-next-line unused-imports/no-unused-vars
const accepted = defineSchema({
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

type S = typeof accepted

// eslint-disable-next-line unused-imports/no-unused-vars
const arrayAccepted = defineSchema([
  { type: 'text', name: 'first' },
  { type: 'select', name: 'second', items: ['a', 'b'] },
])

type AS = typeof arrayAccepted

// Getter form: wraps the getter in a computed with the same const-narrowing.
const computedAccepted = defineComputedSchema(() => ({
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

type CS = typeof computedAccepted.value
type _computedIsComputed = Expect<typeof computedAccepted extends ComputedRef<any> ? true : false>
type _computedModel = Expect<Equal<SchemaToModel<CS>, { text: string | number | null; select: number | null }>>

// ---------------------------------------------------------------------------
// defineSchema — rejection
// ---------------------------------------------------------------------------

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

defineSchema({
  bad_multi: {
    type: 'select',
    items: ['a', 'b'],
    multiple: true,
    // @ts-expect-error — multiple select requires an array model
    default: 'a',
  },
})

defineSchema({
  bad_translate: {
    type: 'text',
    translate: true,
    // @ts-expect-error — translate: true requires a locale-keyed object model
    default: 'plain string',
  },
})

defineSchema({
  bad_checkbox: {
    type: 'checkbox',
    trueValue: 1,
    falseValue: 0,
    // @ts-expect-error — model must be trueValue | falseValue (1 | 0)
    default: 2,
  },
})

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

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

type P = Paths<S>

type _pathText = Expect<'text' extends P ? true : false>
type _pathGroupChild = Expect<'group.nested_text' extends P ? true : false>
type _pathNestedGroupChild = Expect<'nested_group.inner' extends P ? true : false>
type _pathListRow = Expect<'list.0' extends P ? true : false>
// Paths suggests the literal `0` index only (template-literal types never
// show in completions); other indices still resolve via ElementByPath.
type _pathListChild = Expect<'list.0.item_text' extends P ? true : false>
type _pathListChildOtherIndex = Expect<'list.3.item_text' extends P ? false : true>
type _pathFlatListChild = Expect<'flat_list.0' extends P ? true : false>
type _pathGridChild = Expect<'grid.cell_text' extends P ? true : false>
type _pathNestedGridChild = Expect<'nested_grid.cell_inner' extends P ? true : false>
type _noBogusPath = Expect<'bogus' extends P ? false : true>

// Array defaults are const-narrowed to readonly tuples by defineSchema — if
// the model constraint rejects them, inference falls back to the wide
// `(ObjectSchema | ArraySchema) & …` constraint and Array prototype keys leak
// into Paths (i.e. `find()` suggestions).
type _noArrayKeyLeak = Expect<'concat' extends P ? false : true>
type _noArrayKeyLeak2 = Expect<'entries' extends P ? false : true>

type AP = Paths<AS>
type _arrayPathFirst = Expect<'first' extends AP ? true : false>
type _arrayPathSecond = Expect<'second' extends AP ? true : false>

// ---------------------------------------------------------------------------
// SchemaToModel / ModelByPath
// ---------------------------------------------------------------------------

type M = SchemaToModel<S>

type _mText = Expect<Equal<M['text'], string | number | null>>
type _mSelect = Expect<Equal<M['select'], number | null>>
type _mMulti = Expect<Equal<M['multi'], string[]>>
type _mCheck = Expect<Equal<M['check'], 1 | 0>>
// Non-nested group children merge into the parent model.
type _mGroupChild = Expect<Equal<M['nested_text'], string | number | null>>
type _mNestedGroup = Expect<Equal<M['nested_group'], { inner: string | number | null }>>
type _mList = Expect<Equal<M['list'], { item_text: string | number | null; item_select: string | null }[]>>
type _mFlatList = Expect<Equal<M['flat_list'], (string | number | null)[]>>
// Non-nested grid children merge into the parent model.
type _mGridChild = Expect<Equal<M['cell_text'], string | number | null>>
type _mGridSelect = Expect<Equal<M['cell_select'], string | null>>
type _mNestedGrid = Expect<Equal<M['nested_grid'], { cell_inner: string | number | null }>>
// Auto matrix: literal row keys, cells typed via col `schema` (or `any`).
type _mMatrix = Expect<
  Equal<
    M['matrix'],
    {
      row_1: { qty: string | number | null; note: any }
      row_2: { qty: string | number | null; note: any }
    }
  >
>
// Single mode: one widened col value per row (record rows key the model).
type _mSingleMatrix = Expect<Equal<M['single_matrix'], { row_1: string | null; row_2: string | null }>>
// Dynamic multiple mode: array of col value arrays.
type _mDynamicMatrix = Expect<Equal<M['dynamic_matrix'], string[][]>>

type _mvSelect = Expect<Equal<ModelByPath<S, 'select'>, number | null>>
type _mvListChild = Expect<Equal<ModelByPath<S, 'list.0.item_text'>, string | number | null>>
type _mvListRow = Expect<Equal<ModelByPath<S, 'list.0'>, { item_text: string | number | null; item_select: string | null }>>
type _mvFlatListRow = Expect<Equal<ModelByPath<S, 'flat_list.0'>, string | number | null>>
type _mvGridChild = Expect<Equal<ModelByPath<S, 'grid.cell_select'>, string | null>>
type _mvUnknown = Expect<IsAny<ModelByPath<S, 'bogus'>>>

// ---------------------------------------------------------------------------
// ElementByPath — narrowed contexts + fallbacks
// ---------------------------------------------------------------------------

type FoundSelect = ElementByPath<S, 'select'>
type _foundSelectModel = Expect<Equal<FoundSelect['model'], number | null>>
type _foundSelectUpdate = Expect<Equal<Parameters<FoundSelect['update']>[0], number | null>>

type FoundText = ElementByPath<S, 'text'>
type _foundTextModel = Expect<Equal<FoundText['model'], string | number | null>>

type FoundListChild = ElementByPath<S, 'list.2.item_select'>
type _foundListChildModel = Expect<Equal<FoundListChild['model'], string | null>>

// Non-nested group context exposes the scoped projection of its child schema.
type FoundGroup = ElementByPath<S, 'group'>
type _foundGroupModel = Expect<Equal<FoundGroup['model'], { nested_text: string | number | null }>>

// Nested group context exposes a model shaped by its child schema.
type FoundNestedGroup = ElementByPath<S, 'nested_group'>
type _foundNestedGroupModel = Expect<Equal<FoundNestedGroup['model'], { inner: string | number | null }>>
type _foundNestedGroupChild = Expect<Equal<FoundNestedGroup['model']['inner'], string | number | null>>

// List contexts expose a rows-array model shaped by their schema + flat prop.
type FoundList = ElementByPath<S, 'list'>
type _foundListModel = Expect<Equal<FoundList['model'], { item_text: string | number | null; item_select: string | null }[]>>

type FoundFlatList = ElementByPath<S, 'flat_list'>
type _foundFlatListModel = Expect<Equal<FoundFlatList['model'], (string | number | null)[]>>

// Non-flat list rows resolve to the synthetic group prototype.
type FoundListRow = ElementByPath<S, 'list.1'>
type _foundListRowIsGroup = Expect<Equal<FoundListRow['props']['type'], 'group' | undefined>>

// Grid contexts expose the scoped projection of their named cell elements.
type FoundGrid = ElementByPath<S, 'grid'>
type _foundGridModel = Expect<Equal<FoundGrid['model'], { cell_text: string | number | null; cell_select: string | null }>>

type FoundNestedGrid = ElementByPath<S, 'nested_grid'>
type _foundNestedGridModel = Expect<Equal<FoundNestedGrid['model'], { cell_inner: string | number | null }>>

type FoundGridChild = ElementByPath<S, 'grid.cell_text'>
type _foundGridChildModel = Expect<Equal<FoundGridChild['model'], string | number | null>>

// Matrix context exposes a rows/cols/mode-shaped model.
type FoundMatrix = ElementByPath<S, 'matrix'>
type _foundMatrixModel = Expect<
  Equal<
    FoundMatrix['model'],
    {
      row_1: { qty: string | number | null; note: any }
      row_2: { qty: string | number | null; note: any }
    }
  >
>

type FoundUnknown = ElementByPath<S, 'bogus'>
type _unknownIsAny = Expect<IsAny<FoundUnknown>>

// ---------------------------------------------------------------------------
// GetSchemaEntryByPath
// ---------------------------------------------------------------------------

type EntrySelect = GetSchemaEntryByPath<S, 'select'>
type _entryType = Expect<Equal<EntrySelect['type'], 'select'>>
type _entryItemValue = Expect<Equal<EntrySelect['itemValue'], 'id'>>

export {}
