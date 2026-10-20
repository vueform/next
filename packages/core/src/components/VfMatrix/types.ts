import type { Component, VNode } from 'vue'

import type {
  MatrixApi,
  MatrixBindings,
  MatrixClasses,
  MatrixEmits,
  MatrixElementSchema,
  MatrixExpose,
  MatrixParts,
  MatrixProps,
  MatrixSlots,
  ResolvedMatrixCol,
} from '#src/blueprints/matrix'
import type { ResolvedBindings } from '#src/composables'
import type { ObjectModel } from '#src/features'
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
} from '#src/types'

/**
 * Resolved per-part binding bags for VfMatrix slot scopes.
 */
type VfMatrixResolvedBindings = ResolvedBindings<
  VfMatrixParts,
  VfMatrixBindings
>

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
                [
                  Col in Extract<E, Record<string, any>> as Extract<
                    Col[ColValueKeyOf<TEntry> & keyof Col],
                    string | number
                  >
                ]: CellModelOf<Col, ColSchemaKeyOf<TEntry>>
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
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
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
   * Slot that replaces the header row. Receives the header part's resolved
   * bindings and the header definitions.
   *
   * @param scope The header slot's params.
   */
  header: (scope: {
    /**
     * The resolved column header definitions.
     */
    headers: (ResolvedMatrixCol | {})[]

    /**
     * The header row's resolved bindings (part overrides); apply with
     * `v-bind`.
     */
    bindings: VfMatrixResolvedBindings['header']
  }) => VNode[]

  /**
   * Slot that replaces each column header cell.
   *
   * @param scope The col-header slot's params.
   */
  'col-header': (scope: {
    /**
     * The column header's unique ID.
     */
    id: string

    /**
     * The column header label text.
     */
    label: string

    /**
     * The column header's resolved bindings (part overrides, sticky
     * marker); apply with `v-bind`.
     */
    bindings: VfMatrixResolvedBindings['colHeader']
  }) => VNode[]

  /**
   * Slot that replaces each matrix row. Receives row state, drag handlers,
   * label, remove handler, and columns.
   *
   * @param scope The row slot's params.
   */
  row: (scope: {
    /**
     * The row's item index.
     */
    index: number

    /**
     * Whether this row has a header.
     */
    rowHeader: boolean

    /**
     * Whether this row is currently being dragged.
     */
    beingDragged: boolean

    /**
     * Whether this row is the current drop target.
     */
    isDropTarget: boolean

    /**
     * Whether the row can be removed.
     */
    canRemove: boolean

    /**
     * Whether the row can be sorted via drag-and-drop.
     */
    canSort: boolean

    /**
     * The row header label text.
     */
    label: string

    /**
     * The column element definitions for this row.
     */
    cols: { component: string | Component; props: MatrixElementSchema }[]

    /**
     * Handler for the drag enter event.
     *
     * @param $event The native drag event.
     */
    handleDragEnter: ($event: DragEvent) => void

    /**
     * Handler for the drag start event.
     *
     * @param $event The native drag event.
     */
    handleDragStart: ($event: DragEvent) => void

    /**
     * Handler for the drag end event.
     */
    handleDragEnd: () => void

    /**
     * Handler to remove this row.
     */
    remove: () => void
  }) => VNode[]

  /**
   * Slot that replaces each row header cell.
   *
   * @param scope The row-header slot's params.
   */
  'row-header': (scope: {
    /**
     * The row header label text.
     */
    label: string

    /**
     * The row header's resolved bindings (part overrides, sticky
     * marker); apply with `v-bind`.
     */
    bindings: VfMatrixResolvedBindings['rowHeader']
  }) => VNode[]

  /**
   * Slot that replaces the drag sort handle wrapper.
   *
   * @param scope The sort-wrapper slot's params.
   */
  'sort-wrapper': (scope: {
    /**
     * The drag sort handle wrapper's resolved bindings (part
     * overrides); apply with `v-bind`.
     */
    bindings: VfMatrixResolvedBindings['sortWrapper']

    /**
     * Handler for the drag enter event.
     *
     * @param $event The native drag event.
     */
    handleDragEnter: ($event: DragEvent) => void

    /**
     * Handler for the drag start event.
     *
     * @param $event The native drag event.
     */
    handleDragStart: ($event: DragEvent) => void

    /**
     * Handler for the drag end event.
     */
    handleDragEnd: () => void
  }) => VNode[]

  /**
   * Slot that replaces the drag handle. Receives the handle's bindings and
   * drag event handlers.
   *
   * @param scope The sort slot's params.
   */
  sort: (scope: {
    /**
     * The drag handle's resolved bindings (part overrides, localized
     * aria-label); apply with `v-bind`.
     */
    bindings: VfMatrixResolvedBindings['sort']

    /**
     * Handler for the drag enter event.
     *
     * @param $event The native drag event.
     */
    handleDragEnter: ($event: DragEvent) => void

    /**
     * Handler for the drag start event.
     *
     * @param $event The native drag event.
     */
    handleDragStart: ($event: DragEvent) => void

    /**
     * Handler for the drag end event.
     */
    handleDragEnd: () => void
  }) => VNode[]

  /**
   * Slot that replaces each matrix cell. Receives the component, props for the
   * cell element, and a drag enter handler for sortable rows.
   *
   * @param scope The cell slot's params.
   */
  cell: (scope: {
    /**
     * The component name for the cell element.
     */
    component: string | Component

    /**
     * The props passed to the cell element.
     */
    props: MatrixElementSchema

    /**
     * The cell's resolved bindings (part overrides); apply with
     * `v-bind`.
     */
    bindings: VfMatrixResolvedBindings['cell']

    /**
     * Handler for the drag enter event on the cell.
     *
     * @param $event The native drag event.
     */
    handleDragEnter: ($event: DragEvent) => void
  }) => VNode[]

  /**
   * Slot that replaces the row remove button wrapper.
   *
   * @param scope The remove-wrapper slot's params.
   */
  'remove-wrapper': (scope: {
    /**
     * The row remove button wrapper's resolved bindings (part
     * overrides); apply with `v-bind`.
     */
    bindings: VfMatrixResolvedBindings['removeWrapper']

    /**
     * Handler to remove the row.
     */
    handleRemove: () => void
  }) => VNode[]

  /**
   * Slot that replaces the row remove button.
   *
   * @param scope The remove slot's params.
   */
  remove: (scope: {
    /**
     * The remove button's resolved bindings (part overrides,
     * localized aria-label fallback); apply with `v-bind`.
     */
    bindings: VfMatrixResolvedBindings['remove']

    /**
     * Handler to remove the row.
     */
    handleRemove: () => void
  }) => VNode[]

  /**
   * Slot that replaces the add row button. Receives the button's bindings,
   * label, and add handler.
   *
   * @param scope The add slot's params.
   */
  add: (scope: {
    /**
     * The button label text.
     */
    label: TProp | string

    /**
     * The add button's resolved bindings (part overrides, fallback
     * aria-label); apply with `v-bind`.
     */
    bindings: VfMatrixResolvedBindings['add']

    /**
     * Handler to add a new row.
     */
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
   * @param index The row's zero-based index.
   * @tag VfButton
   */
  sort: (index: number) => PartOf<'VfButton'>

  /**
   * The remove action element.
   *
   * @param index The row's zero-based index.
   * @tag VfButton
   */
  remove: (index: number) => PartOf<'VfButton'>

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
   * Each row element. Drag state is exposed via `data-dragging` and
   * `data-drop-target` attributes.
   */
  row: ClassValue

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
 * Part-keyed binding definitions of the VfMatrix component. The grid /
 * header-related / add entries are zero-argument resolvers — resolved at each
 * part's consuming site, keys stay static — while the per-row `row` and
 * per-index `sort` / `remove` entries are parameterized, so those keys are
 * functional.
 */
export interface VfMatrixBindings extends MatrixBindings {
  /**
   * The root element's label-alignment marker, set while the element renders
   * without help text.
   */
  root: {
    'data-align-label'?: ''
  }

  /**
   * The matrix grid's scroll-mode marker, set while `scrollable` is enabled.
   */
  grid: {
    'data-scrollable'?: ''
  }

  /**
   * Each column header's sticky marker, set while `stickyCols` is enabled.
   */
  colHeader: {
    'data-sticky'?: ''
  }

  /**
   * Each row header's sticky marker, set while `stickyRows` is enabled.
   */
  rowHeader: {
    'data-sticky'?: ''
  }

  /**
   * Each row element's drag state.
   *
   * @param beingDragged Whether this row is currently being dragged.
   * @param isDropTarget Whether this row is the current drop target.
   */
  row: (
    beingDragged: boolean,
    isDropTarget: boolean
  ) => {
    'data-dragging'?: ''
    'data-drop-target'?: ''
  }

  /**
   * The add-row control's localized accessible name (when it renders without
   * a visible label).
   */
  add: {
    'aria-label'?: string
  }

  /**
   * The per-row sort handle's localized accessible name.
   *
   * @param index The row's zero-based index.
   */
  sort: (index: number) => {
    'aria-label': string
  }

  /**
   * The per-row remove control's localized accessible name (when it renders
   * without a visible label).
   *
   * @param index The row's zero-based index.
   */
  remove: (index: number) => {
    'aria-label'?: string
  }
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
  VfMatrixBindings,
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
