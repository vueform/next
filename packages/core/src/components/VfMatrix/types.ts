import type {
  MatrixApi,
  MatrixClasses,
  MatrixEmits,
  MatrixElementSchema,
  MatrixExpose,
  MatrixParts,
  MatrixProps,
  MatrixSlots,
  ResolvedMatrixCol,
} from '~/blueprints/matrix'
import type { ObjectModel } from '~/features'
import type {
  DefineElementContext,
  ClassValue,
  DomAttrsOf,
  ElementToModel,
  EntryPropOf,
  IsAny,
  PartOf,
  Prettify,
  TProp,
  DefineRegistryEntry,
  WidenProps,
  UnwrapEntryRef,
  WidenScalar,
} from '~/types'
import type { Component, VNode } from 'vue'

/**
 * The resolved selection mode from a registry `TEntry` payload — anything but
 * an explicit `'single'` / `'multiple'` resolves to `'auto'`, matching the
 * runtime resolution.
 */
export type EntryModeOf<TEntry> =
  EntryPropOf<TEntry, 'mode'> extends infer M
    ? M extends 'single'
      ? 'single'
      : M extends 'multiple'
        ? 'multiple'
        : 'auto'
    : 'auto'
/**
 * The string key used to read a column's value from object cols (`colValue`,
 * defaulting to `'value'`). Function / `null` resolvers are not statically
 * resolvable and yield `never` (callers fall back to a wide shape).
 */
export type ColValueKeyOf<TEntry> =
  EntryPropOf<TEntry, 'colValue'> extends infer K
    ? [K] extends [undefined]
      ? 'value'
      : K extends string
        ? K
        : never
    : 'value'

/**
 * The string key used to read a column's custom element schema from object cols
 * (`colSchema`, defaulting to `'schema'`).
 */
export type ColSchemaKeyOf<TEntry> =
  EntryPropOf<TEntry, 'colSchema'> extends infer K
    ? [K] extends [undefined]
      ? 'schema'
      : K extends string
        ? K
        : never
    : 'schema'

/**
 * The string key used to read a row's value from object rows (`rowValue`,
 * defaulting to `'value'`).
 */
export type RowValueKeyOf<TEntry> =
  EntryPropOf<TEntry, 'rowValue'> extends infer K
    ? [K] extends [undefined]
      ? 'value'
      : K extends string
        ? K
        : never
    : 'value'

/**
 * The auto-mode cell model for a single object col: its custom element schema
 * resolved through the registry, or `any` when absent (the default cell input
 * comes from runtime config and is not statically knowable).
 */
export type CellModelOf<Col, SchemaKey> = SchemaKey extends keyof Col
  ? Col[SchemaKey] extends { type: string }
    ? ElementToModel<Col[SchemaKey]>
    : any
  : any

/**
 * The selection value union for single / multiple modes, resolved from `cols`
 * and widened to primitives. Endpoint / function cols yield `any`.
 */
export type ColSelectionOf<TEntry> =
  UnwrapEntryRef<EntryPropOf<TEntry, 'cols'>> extends infer C
    ? [C] extends [undefined]
      ? any
      : C extends string | ((...args: any) => any)
        ? any
        : C extends readonly (infer E)[]
          ? E extends Record<string, any>
            ? ColValueKeyOf<TEntry> extends infer K
              ? K extends keyof E
                ? WidenScalar<E[K]>
                : any
              : any
            : WidenScalar<E>
          : C extends Record<string, any>
            ? Extract<keyof C, string | number>
            : any
    : any

/**
 * The auto-mode row object: keys are the literal col values (they become the
 * row's child element names), each cell typed via the col's custom `schema` or
 * `any`. Endpoint / function cols yield a wide record.
 */
export type AutoRowOf<TEntry> =
  UnwrapEntryRef<EntryPropOf<TEntry, 'cols'>> extends infer C
    ? [C] extends [undefined]
      ? Record<string, any>
      : C extends string | ((...args: any) => any)
        ? Record<string, any>
        : C extends readonly (infer E)[]
          ? Prettify<
              {
                [Col in Extract<E, Record<string, any>> as Extract<
                  Col[ColValueKeyOf<TEntry> & keyof Col],
                  string | number
                >]: CellModelOf<Col, ColSchemaKeyOf<TEntry>>
              } & {
                [V in Extract<E, string | number>]: any
              }
            >
          : C extends Record<string, any>
            ? { [K in Extract<keyof C, string | number>]: any }
            : Record<string, any>
    : Record<string, any>

/**
 * The per-row model resolved from `cols` + `mode`: an object of cell values
 * (`auto`), an array of selected col values (`multiple`), or a single col value
 * (`single`).
 */
export type MatrixRowOf<TEntry> =
  EntryModeOf<TEntry> extends infer M
    ? M extends 'single'
      ? ColSelectionOf<TEntry> | null
      : M extends 'multiple'
        ? ColSelectionOf<TEntry>[]
        : AutoRowOf<TEntry>
    : never

/**
 * Whether the matrix carries an array model: numeric `rows`, or `rows` and
 * `endpoint` both absent — matching the runtime `dynamic` flag.
 */
export type IsDynamicMatrix<TEntry> =
  UnwrapEntryRef<EntryPropOf<TEntry, 'rows'>> extends infer R
    ? [R] extends [undefined]
      ? EntryPropOf<TEntry, 'endpoint'> extends string
        ? false
        : true
      : R extends number
        ? true
        : false
    : true

/**
 * The literal row keys of a static matrix resolved from `rows` (scalar array,
 * record map, or object array via `rowValue`). Endpoint / function rows yield
 * `never` (callers fall back to a wide record).
 */
export type RowKeysOf<TEntry> =
  UnwrapEntryRef<EntryPropOf<TEntry, 'rows'>> extends infer R
    ? R extends string | ((...args: any) => any)
      ? never
      : R extends readonly (infer E)[]
        ? E extends Record<string, any>
          ? RowValueKeyOf<TEntry> extends infer K
            ? K extends keyof E
              ? Extract<E[K], string | number>
              : never
            : never
          : Extract<E, string | number>
        : R extends Record<string, any>
          ? Extract<keyof R, string | number>
          : never
    : never

/**
 * The matrix model resolved from a registry `TEntry` payload's `rows` / `cols`
 * / `mode` props: dynamic matrices (numeric or absent `rows`) carry an array of
 * row values, static matrices key row values by their literal row values. Wide
 * / `any` entries stay permissive (`ObjectModel`).
 */
export type MatrixModelOf<TEntry> =
  IsAny<EntryPropOf<TEntry, 'mode'>> extends true
    ? ObjectModel
    : MatrixRowOf<TEntry> extends infer Row
      ? IsDynamicMatrix<TEntry> extends true
        ? Row[]
        : [RowKeysOf<TEntry>] extends [never]
          ? Record<string, Row>
          : Prettify<{ [K in RowKeysOf<TEntry>]: Row }>
      : never

/**
 * VfMatrix props narrowed from a registry `TEntry` payload — `modelValue` is
 * driven by `rows` / `cols` / `mode` the same way select models are driven by
 * `items`. Feeds both `defineSchema` validation and the narrowed
 * `VfMatrixContext` / `MatrixApi` model slice used by `find()`.
 */
export type EntryProps<TEntry> = Omit<VfMatrixProps, 'modelValue'> & {
  modelValue?: MatrixModelOf<TEntry>
}

/**
 * Props for the VfMatrix component.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/vite/build` (see the `#shorthands` marker import on
 * `unstyled.ts`).
 */
export interface VfMatrixProps extends MatrixProps<
  'matrix',
  VfMatrixSlots,
  VfMatrixParts,
  VfMatrixClasses,
  VfMatrixContext
> {}

/**
 * Events emitted by the VfMatrix component.
 */
export interface VfMatrixEmits extends MatrixEmits<VfMatrixContext> {}

/**
 * Slots available in the VfMatrix component.
 */
export interface VfMatrixSlots extends MatrixSlots<VfMatrixContext> {
  /**
   * Slot for the default matrix content.
   */
  default: () => VNode[]

  /**
   * Slot that replaces the header row. Receives class and header definitions.
   *
   * @param props.class CSS classes for the header row.
   * @param props.headers The resolved column header definitions.
   */
  header: (props: {
    class: ClassValue
    headers: (ResolvedMatrixCol | {})[]
  }) => VNode[]

  /**
   * Slot that replaces each column header cell.
   *
   * @param props.class CSS classes for the column header.
   * @param props.id The column header's unique ID.
   * @param props.label The column header label text.
   */
  colHeader: (props: {
    class: ClassValue
    id: string
    label: string
  }) => VNode[]

  /**
   * Slot that replaces each matrix row. Receives row state, drag handlers,
   * label, remove handler, and columns.
   *
   * @param props.class CSS classes for the row.
   * @param props.index The row's item index.
   * @param props.rowHeader Whether this row has a header.
   * @param props.beingDragged Whether this row is currently being dragged.
   * @param props.isDropTarget Whether this row is the current drop target.
   * @param props.handleDragEnter Handler for the drag enter event.
   * @param props.handleDragStart Handler for the drag start event.
   * @param props.handleDragEnd Handler for the drag end event.
   * @param props.canRemove Whether the row can be removed.
   * @param props.canSort Whether the row can be sorted via drag-and-drop.
   * @param props.label The row header label text.
   * @param props.remove Handler to remove this row.
   * @param props.cols The column element definitions for this row.
   */
  row: (props: {
    class: ClassValue
    index: number
    rowHeader: boolean
    beingDragged: boolean
    isDropTarget: boolean
    handleDragEnter: ($event: DragEvent) => void
    handleDragStart: ($event: DragEvent) => void
    handleDragEnd: () => void
    canRemove: boolean
    canSort: boolean
    label: string
    remove: () => void
    cols: { component: string | Component; props: MatrixElementSchema }[]
  }) => VNode[]

  /**
   * Slot that replaces each row header cell.
   *
   * @param props.class CSS classes for the row header.
   * @param props.label The row header label text.
   */
  rowHeader: (props: { class: ClassValue; label: string }) => VNode[]

  /**
   * Slot that replaces the drag sort handle wrapper.
   *
   * @param props.class CSS classes for the wrapper.
   * @param props.handleDragStart Handler for the drag start event.
   * @param props.handleDragEnd Handler for the drag end event.
   */
  sortWrapper: (props: {
    class: ClassValue
    handleDragEnter: ($event: DragEvent) => void
    handleDragStart: ($event: DragEvent) => void
    handleDragEnd: () => void
  }) => VNode[]

  /**
   * Slot that replaces the drag handle. Receives class and drag event handlers.
   *
   * @param props.class CSS classes for the handle element.
   * @param props.handleDragStart Handler for the drag start event.
   * @param props.handleDragEnd Handler for the drag end event.
   */
  sort: (props: {
    class: ClassValue
    handleDragEnter: ($event: DragEvent) => void
    handleDragStart: ($event: DragEvent) => void
    handleDragEnd: () => void
  }) => VNode[]

  /**
   * Slot that replaces each matrix cell. Receives the component, props for the
   * cell element, and a drag enter handler for sortable rows.
   *
   * @param props.component The component name for the cell element.
   * @param props.props The props passed to the cell element.
   * @param props.handleDragEnter Handler for the drag enter event on the cell.
   */
  cell: (props: {
    component: string | Component
    props: MatrixElementSchema
    handleDragEnter: ($event: DragEvent) => void
  }) => VNode[]

  /**
   * Slot that replaces the row remove button wrapper.
   *
   * @param props.class CSS classes for the wrapper.
   * @param props.handleRemove Handler to remove the row.
   */
  removeWrapper: (props: {
    class: ClassValue
    handleRemove: () => void
  }) => VNode[]

  /**
   * Slot that replaces the row remove button.
   *
   * @param props.class CSS classes for the remove button.
   * @param props.handleRemove Handler to remove the row.
   */
  remove: (props: { class: ClassValue; handleRemove: () => void }) => VNode[]

  /**
   * Slot that replaces the add row button. Receives class, label, and add
   * handler.
   *
   * @param props.class CSS classes for the add button.
   * @param props.label The button label text.
   * @param props.handleAdd Handler to add a new row.
   */
  add: (props: {
    class: ClassValue
    label: TProp | string
    handleAdd: () => void
  }) => VNode[]
}

/**
 * Structural parts of the VfMatrix component.
 */
export interface VfMatrixParts extends MatrixParts {
  /**
   * The grid layout element.
   *
   * @tag div
   */
  grid: DomAttrsOf<'div'>

  /**
   * The header row element with `display: contents`.
   *
   * @tag div
   */
  header: DomAttrsOf<'div'>

  /**
   * Each column header element.
   *
   * @tag div
   */
  colHeader: DomAttrsOf<'div'>

  /**
   * The screen-reader-only header element.
   *
   * @tag div
   */
  srOnlyHeader: DomAttrsOf<'div'>

  /**
   * Each row element with `display: contents`.
   *
   * @tag div
   */
  row: DomAttrsOf<'div'>

  /**
   * Each row header element.
   *
   * @tag div
   */
  rowHeader: DomAttrsOf<'div'>

  /**
   * Each cell element.
   *
   * @tag div
   */
  cell: DomAttrsOf<'div'>

  /**
   * The drag sort handle wrapper element.
   *
   * @tag div
   */
  sortWrapper: DomAttrsOf<'div'>

  /**
   * The row remove button wrapper element.
   *
   * @tag div
   */
  removeWrapper: DomAttrsOf<'div'>

  /**
   * The drag sort handle element.
   *
   * @tag VfButton
   */
  sort: PartOf<'VfButton'>

  /**
   * The remove action element.
   *
   * @tag VfButton
   */
  remove: PartOf<'VfButton'>

  /**
   * The add action element.
   *
   * @tag VfButton
   */
  add: PartOf<'VfButton'>
}

/**
 * CSS classes for the VfMatrix component's structural parts.
 */
export interface VfMatrixClasses extends MatrixClasses {
  /**
   * The grid layout element.
   */
  grid: ClassValue

  /**
   * The header row element.
   */
  header: ClassValue

  /**
   * Each column header element.
   */
  colHeader: ClassValue

  /**
   * Each row element. Receives drag state.
   *
   * @param beingDragged Whether this row is currently being dragged.
   * @param isDropTarget Whether this row is the current drop target.
   */
  row: (beingDragged: boolean, isDropTarget: boolean) => ClassValue

  /**
   * Each row header element.
   */
  rowHeader: ClassValue

  /**
   * Each cell element.
   */
  cell: ClassValue

  /**
   * The drag sort handle wrapper element.
   */
  sortWrapper: ClassValue

  /**
   * The drag sort handle element.
   */
  sort: ClassValue

  /**
   * The row remove button wrapper element.
   */
  removeWrapper: ClassValue

  /**
   * The row remove button element.
   */
  remove: ClassValue

  /**
   * The add row button element.
   */
  add: ClassValue
}

/**
 * Augmentable public API surface for VfMatrix.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `MatrixExpose` for all matrix-based components) so they
 * appear on `ContextOf<'VfMatrix'>` / `context$` / `defineExpose`.
 */
export interface VfMatrixExpose extends MatrixExpose {}

/**
 * Public context for VfMatrix, optionally parameterized by concrete props (e.g.
 * rows/cols/mode-narrowed `EntryProps` with a typed `modelValue`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
export interface VfMatrixContext<
  TProps extends WidenProps<VfMatrixProps, MatrixProps<string>> = VfMatrixProps,
> extends DefineElementContext<
  TProps,
  VfMatrixEmits,
  VfMatrixSlots,
  VfMatrixParts,
  VfMatrixClasses,
  VfMatrixExpose,
  MatrixApi<TProps>
> {}

/**
 * Registry entry for VfMatrix. `TEntry` narrows `modelValue` from the entry's
 * `rows` / `cols` / `mode` props so `defineSchema` constrains matrix models
 * (and `default`s) to their row/col shape and types `find()`'s returned `model`
 * the same way.
 */
export interface VfMatrixEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfMatrixEmits,
  VfMatrixSlots,
  VfMatrixParts,
  VfMatrixClasses,
  VfMatrixContext<EntryProps<TEntry>>
> {}
