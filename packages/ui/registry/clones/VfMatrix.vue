<script setup lang="ts">
/**
 * VfCloneName — a custom element created from Vueform's `matrix` blueprint.
 *
 * @see https://ui.vueform.com/guide/components#building-on-blueprints
 */

import {
  useBlueprint,
  useLocale,
  defineEvents,
  isPlainObject,
  type ClassValue,
  type DefineElementContext,
  type DomAttrsOf,
  type PartOf,
  type TProp,
  type WidenProps,
} from '@vueform/ui'
import {
  blueprint,
  defaults,
  normalizeSourceItems,
  resolveItemProp,
  type MatrixApi,
  type MatrixClasses,
  type MatrixElementSchema,
  type MatrixEmits,
  type MatrixExpose,
  type MatrixParts,
  type MatrixProps,
  type MatrixSlots,
  type ResolvedMatrixCol,
} from '@vueform/ui/blueprints/matrix'

import '@vueform/ui/matrix.css'
import '@vueform/ui/tabular.css'
import type { Component, VNode } from 'vue'

/**
 * Prop definitions.
 *
 * @example
 *   custom?: any
 */
export interface VfCloneNameProps extends MatrixProps<
  '__TYPE__',
  VfCloneNameSlots,
  VfCloneNameParts,
  VfCloneNameClasses,
  VfCloneNameContext
> {}

/**
 * Emit / event definitions.
 *
 * @example
 *   custom: [arg1: any, arg2: any, context$: VfCloneNameContext]
 *
 * @see https://ui.vueform.com/guide/event-handlers
 */
export interface VfCloneNameEmits extends MatrixEmits<VfCloneNameContext> {}

/**
 * Slot definitions.
 *
 * @example
 *   custom: (props: { prop1: any; prop2: any }) => import('vue').VNode[]
 *
 * @see https://ui.vueform.com/guide/slots
 */
export interface VfCloneNameSlots extends MatrixSlots<VfCloneNameContext> {
  /**
   * Slot for the default matrix content.
   */
  default: () => VNode[]

  /**
   * Slot that replaces the header row. Receives the header part's classes and
   * part bag and the header definitions.
   *
   * @param scope The header slot's params.
   */
  header: (scope: {
    /**
     * The resolved column header definitions.
     */
    headers: (ResolvedMatrixCol | {})[]

    /**
     * The header row's resolved bindings (classes, part overrides); apply with
     * `v-bind`.
     */
    bindings: VfMatrixBindings['header']
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
     * The column header's resolved bindings (classes, part overrides, sticky
     * modifier); apply with `v-bind`.
     */
    bindings: VfMatrixBindings['colHeader']
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
     * The row header's resolved bindings (classes, part overrides, sticky
     * modifier); apply with `v-bind`.
     */
    bindings: VfMatrixBindings['rowHeader']
  }) => VNode[]

  /**
   * Slot that replaces the drag sort handle wrapper.
   *
   * @param scope The sort-wrapper slot's params.
   */
  'sort-wrapper': (scope: {
    /**
     * The drag sort handle wrapper's resolved bindings (classes, part
     * overrides); apply with `v-bind`.
     */
    bindings: VfMatrixBindings['sortWrapper']

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
   * Slot that replaces the drag handle. Receives classes, part, and drag
   * event handlers.
   *
   * @param scope The sort slot's params.
   */
  sort: (scope: {
    /**
     * The drag handle's resolved bindings (classes, part overrides, localized
     * aria-label); apply with `v-bind`.
     */
    bindings: VfMatrixBindings['sort']

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
     * The cell's resolved bindings (classes, part overrides); apply with
     * `v-bind`.
     */
    bindings: VfMatrixBindings['cell']

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
     * The row remove button wrapper's resolved bindings (classes, part
     * overrides); apply with `v-bind`.
     */
    bindings: VfMatrixBindings['removeWrapper']

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
     * The remove button's resolved bindings (classes, part overrides,
     * localized aria-label fallback); apply with `v-bind`.
     */
    bindings: VfMatrixBindings['remove']

    /**
     * Handler to remove the row.
     */
    handleRemove: () => void
  }) => VNode[]

  /**
   * Slot that replaces the add row button. Receives classes, part, label, and
   * add handler.
   *
   * @param scope The add slot's params.
   */
  add: (scope: {
    /**
     * The button label text.
     */
    label: TProp | string

    /**
     * The add button's resolved bindings (classes, part overrides, fallback
     * aria-label); apply with `v-bind`.
     */
    bindings: VfMatrixBindings['add']

    /**
     * Handler to add a new row.
     */
    handleAdd: () => void
  }) => VNode[]
}

/**
 * Part definitions.
 *
 * @example
 *   tag: import('@vueform/ui').DomAttrsOf<'div'>
 *   component: import('@vueform/ui').PartOf<'VfButton'>
 *
 * @see https://ui.vueform.com/guide/parts
 */
export interface VfCloneNameParts extends MatrixParts {
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
 * Class definitions.
 *
 * @example
 *   plain: import('@vueform/ui').ClassValue
 *   dynamic: (arg1: any, arg2: any) => import('@vueform/ui').ClassValue
 *
 * @see https://ui.vueform.com/guide/classes
 */
export interface VfCloneNameClasses extends MatrixClasses {
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
   *
   * @param index The row's zero-based index.
   */
  sort: (index: number) => ClassValue

  /**
   * The row remove button wrapper element.
   */
  removeWrapper: ClassValue

  /**
   * The row remove button element.
   *
   * @param index The row's zero-based index.
   */
  remove: (index: number) => ClassValue

  /**
   * The add row button element.
   */
  add: ClassValue
}

/**
 * Custom exposed API members. Add props you return from useBlueprint's
 * 5th 'extend' callback.
 *
 * @example
 *   plain: string
 *   vueRef: import('vue').Ref<string>
 *   method: (arg1: any, arg2: any) => string
 *
 * @see https://ui.vueform.com/guide/components#expose-interface
 */
export interface VfCloneNameExpose extends MatrixExpose {}

/**
 * The element's context — the object slots, outlets, and event handlers
 * receive (`context$`). Its shape is derived from the blueprint and the
 * interfaces above — customize those; don't extend or edit this one.
 */
export interface VfCloneNameContext<
  TProps extends WidenProps<VfCloneNameProps, MatrixProps<string>> =
    VfCloneNameProps,
> extends DefineElementContext<
  TProps,
  VfCloneNameEmits,
  VfCloneNameSlots,
  VfCloneNameParts,
  VfCloneNameClasses,
  VfMatrixModifiers,
  VfMatrixA11y,
  VfCloneNameExpose,
  MatrixApi<TProps>
> {}

defineOptions({
  name: 'VfCloneName',
  element: true,
  inheritAttrs: false,
  children: (props) => {
    const mode =
      props.mode === 'single'
        ? 'single'
        : props.mode === 'multiple'
          ? 'multiple'
          : 'auto'

    const dynamic =
      (props.rows === undefined && !props.endpoint) ||
      typeof props.rows === 'number'

    const rowType =
      mode === 'single'
        ? 'radios'
        : mode === 'multiple'
          ? 'checkboxes'
          : 'group'

    let rowEntry: Record<string, any>

    if (mode === 'auto') {
      const colsRaw =
        typeof props.cols === 'string' || typeof props.cols === 'function'
          ? []
          : (props.cols ?? [])

      const cellEntries: Record<string, Record<string, any>> = {}

      normalizeSourceItems(
        colsRaw as any[] | Record<string, any>,
        props.colValue ?? 'value',
        props.colLabel ?? 'label'
      ).forEach((col, i) => {
        const schema = resolveItemProp(col.$raw, props.colSchema ?? 'schema')
        const type = schema?.type || 'text'
        const name = isPlainObject(col.value) ? String(i) : String(col.value)
        cellEntries[name] = { type, ...schema }
      })

      rowEntry = { type: rowType, nested: true, schema: cellEntries }
    } else {
      rowEntry = { type: rowType }
    }

    if (dynamic) {
      const count = (typeof props.rows === 'number' ? props.rows : 0) || 1

      const entries: Record<string, Record<string, any>> = {}
      for (let i = 0; i < count; i++) {
        entries[String(i)] = rowEntry
      }

      return { array: true, entries }
    }

    const rowsRaw =
      typeof props.rows === 'string' || typeof props.rows === 'function'
        ? []
        : (props.rows ?? [])

    const entries: Record<string, Record<string, any>> = {}

    normalizeSourceItems(
      rowsRaw as any[] | Record<string, any>,
      props.rowValue ?? 'value',
      props.rowLabel ?? 'label'
    ).forEach((row) => {
      entries[String(row.value)] = rowEntry
    })

    return { entries }
  },
})
defineEmits<VfCloneNameEmits>()

const props = withDefaults(defineProps<VfCloneNameProps>(), {
  ...defaults,
  type: '__TYPE__',
})
const events = defineEvents<VfCloneNameEmits>()
const slots = defineSlots<VfCloneNameSlots>()

/**
 * Extend the element's API by passing a 5th 'extend' callback to
 * useBlueprint — whatever it returns merges into the api / expose
 * (declare the members on VfCloneNameExpose above).
 *
 * @example
 *   useBlueprint(blueprint, props, events, slots, () => ({
 *     plain: '',
 *     vueRef: ref(''),
 *     method: (arg1: any, arg2: any) => '',
 *   }))
 *
 * @see https://ui.vueform.com/guide/components#extending-the-logic
 */
const {
  api,
  context,
  expose,
  outlets,
  bindings,
  useClasses,
  useModifiers,
  useA11y,
} = useBlueprint(blueprint, props, events, slots)

const { t } = useLocale()

/**
 * The element's own classes, per part — reactive via the callback's api
 * refs. The class keys come from VfCloneNameClasses above.
 *
 * @see https://ui.vueform.com/guide/classes
 */
useClasses(({ props, gridClass }) => ({
  root: {
    'vf-matrix': true,
    'vf-tabular': !!props.tabular,
    'vf-wrap-col-headers': !!props.wrapColHeaders,
    'vf-wrap-row-headers': !!props.wrapRowHeaders,
  },
  grid: {
    'vf-matrix-grid': true,
    [gridClass.value]: true,
  },
  header: 'vf-matrix-header',
  colHeader: 'vf-matrix-col-header',
  row: 'vf-matrix-row',
  rowHeader: 'vf-matrix-row-header',
  cell: 'vf-matrix-cell',
  sortWrapper: 'vf-matrix-row-sort',
  sort: () => 'vf-matrix-sort',
  removeWrapper: 'vf-matrix-row-remove',
  remove: () => 'vf-matrix-remove',
  add: 'vf-matrix-add',
}))

useModifiers(({ props }) => ({
  grid: {
    'data-scrollable': props.scrollable ? '' : undefined,
  },
  colHeader: {
    'data-sticky': props.stickyCols ? '' : undefined,
  },
  rowHeader: {
    'data-sticky': props.stickyRows ? '' : undefined,
  },
  row: (beingDragged: boolean, isDropTarget: boolean) => ({
    'data-dragging': beingDragged ? '' : undefined,
    'data-drop-target': isDropTarget ? '' : undefined,
  }),
}))

useA11y(({ addLabel, removeLabel }) => ({
  add: {
    'aria-label': addLabel.value ? undefined : t('sr_matrix_add'),
  },
  sort: (index: number) => ({
    'aria-label': t('sr_matrix_sort', { index: index + 1 }),
  }),
  remove: (index: number) => ({
    'aria-label': removeLabel.value
      ? undefined
      : t('sr_matrix_remove', { index: index + 1 }),
  }),
}))

const {
  canAdd,
  canRemove,
  canSort,
  showRowHeaders,
  showColHeaders,
  gridClass,
  gridColumns,
  nonce,
  addLabel,
  removeLabel,
  addIcon,
  removeIcon,
  sortIcon,
  resolvedRows,
  dragIndex,
  dropTarget,
  headers,
  handleAdd,
  handleDragStart,
  handleDragEnter,
  handleDragEnd,
  handleDrop,
  handleWrapperDragOver,
} = api

defineExpose(expose)
</script>

<script lang="ts">
import type {
  DefineRegistryEntry,
  ElementToModel,
  EntryPropOf,
  IsAny,
  ObjectModel,
  Prettify,
  ResolvedBindings,
  UnwrapEntryRef,
  WidenScalar,
} from '@vueform/ui'

type VfMatrixBindings = ResolvedBindings<
  VfCloneNameParts,
  VfMatrixModifiers,
  VfMatrixA11y
>

type EntryModeOf<TEntry> =
  EntryPropOf<TEntry, 'mode'> extends infer M
    ? M extends 'single'
      ? 'single'
      : M extends 'multiple'
        ? 'multiple'
        : 'auto'
    : 'auto'

type ColValueKeyOf<TEntry> =
  EntryPropOf<TEntry, 'colValue'> extends infer K
    ? [K] extends [undefined]
      ? 'value'
      : K extends string
        ? K
        : never
    : 'value'

type ColSchemaKeyOf<TEntry> =
  EntryPropOf<TEntry, 'colSchema'> extends infer K
    ? [K] extends [undefined]
      ? 'schema'
      : K extends string
        ? K
        : never
    : 'schema'

type RowValueKeyOf<TEntry> =
  EntryPropOf<TEntry, 'rowValue'> extends infer K
    ? [K] extends [undefined]
      ? 'value'
      : K extends string
        ? K
        : never
    : 'value'

type CellModelOf<Col, SchemaKey> = SchemaKey extends keyof Col
  ? Col[SchemaKey] extends { type: string }
    ? ElementToModel<Col[SchemaKey]>
    : any
  : any

type ColSelectionOf<TEntry> =
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

type AutoRowOf<TEntry> =
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

type MatrixRowOf<TEntry> =
  EntryModeOf<TEntry> extends infer M
    ? M extends 'single'
      ? ColSelectionOf<TEntry> | null
      : M extends 'multiple'
        ? ColSelectionOf<TEntry>[]
        : AutoRowOf<TEntry>
    : never

type IsDynamicMatrix<TEntry> =
  UnwrapEntryRef<EntryPropOf<TEntry, 'rows'>> extends infer R
    ? [R] extends [undefined]
      ? EntryPropOf<TEntry, 'endpoint'> extends string
        ? false
        : true
      : R extends number
        ? true
        : false
    : true

type RowKeysOf<TEntry> =
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

type MatrixModelOf<TEntry> =
  IsAny<EntryPropOf<TEntry, 'mode'>> extends true
    ? ObjectModel
    : MatrixRowOf<TEntry> extends infer Row
      ? IsDynamicMatrix<TEntry> extends true
        ? Row[]
        : [RowKeysOf<TEntry>] extends [never]
          ? Record<string, Row>
          : Prettify<{ [K in RowKeysOf<TEntry>]: Row }>
      : never

type EntryProps<TEntry> = Omit<VfCloneNameProps, 'modelValue'> & {
  modelValue?: MatrixModelOf<TEntry>
}

declare module '@vueform/core' {
  interface ControlRegistry<TEntry = Record<string, any>> {
    VfCloneName: DefineRegistryEntry<
      EntryProps<TEntry>,
      VfCloneNameEmits,
      VfCloneNameSlots,
      VfCloneNameParts,
      VfCloneNameClasses,
      VfCloneNameContext<EntryProps<TEntry>>
    >
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfCloneName: (typeof import('./VfCloneName.vue'))['default']
  }
}
</script>

<template>
  <slot name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <VfLayout v-else>
      <div
        ref="list"
        v-bind="bindings.grid"
        @dragover="handleWrapperDragOver"
        @drop="handleDrop"
      >
        <slot
          v-if="showColHeaders"
          name="header"
          :headers
          :bindings="bindings.header"
        >
          <component
            v-if="outlets?.header"
            :is="outlets.header"
            :headers
            :bindings="bindings.header"
          />
          <div v-else v-bind="bindings.header">
            <template
              v-for="({ id, label, available }, i) in headers"
              :key="id || i"
            >
              <slot
                name="col-header"
                v-if="!id || available.value"
                :id
                :label
                :bindings="bindings.colHeader"
              >
                <component
                  v-if="outlets?.['col-header']"
                  :is="outlets['col-header']"
                  :id
                  :label
                  :bindings="bindings.colHeader"
                />
                <div v-else :id v-bind="bindings.colHeader">
                  {{ label }}
                </div>
              </slot>
            </template>
          </div>
        </slot>

        <div
          v-for="(row, rowIndex) in resolvedRows"
          :key="row.key"
          v-show="row.available.value"
          v-bind="
            bindings.row(dragIndex === row.dataIndex, dropTarget === row.key)
          "
        >
          <component :is="row.component" v-bind="row.props">
            <!--
              TEMPORARY deviation from the standard `slot > outlet > default`
              pattern, forced by a Vue Vapor bug (present in 3.6.0-rc.5 and
              still in rc.11): an outlet inside slot content handed to another
              component compiles as FORWARDED, and rendering a forwarded
              outlet's fallback notifies the enclosing slot's resolution
              boundary, which re-renders that fallback from scratch — the
              cells register themselves on the form in setup, so this
              revalidation becomes an infinite cell remount loop that hangs
              the page. The outlets below therefore gate on slot presence
              (`v-if="slots.x"`) with the default markup as sibling `v-else`
              branches, so no outlet (and no fallback machinery) exists unless
              its slot is actually given. Known edge vs the standard pattern:
              a slot that is provided but renders nothing shows nothing here
              instead of the default markup.

              Revert to the standard pattern (fold each chain back into slot
              fallback content, like every other component) once vapor no
              longer loops: bump the vue-vapor / vue-compiler-sfc-vapor
              catalog pins, restore the pattern, and run
              `pnpm --filter @vueform/ui test-smoke --env vapor` — the matrix
              is part of the smoke canon exactly so that a premature revert
              fails there instead of regressing silently.
            -->
            <template #[row.slot]="{ label }">
              <slot
                v-if="slots.row"
                name="row"
                :index="row.dataIndex"
                :row-header="showRowHeaders"
                :being-dragged="dragIndex === row.dataIndex"
                :is-drop-target="dropTarget === row.key"
                :label
                :cols="resolvedRows[rowIndex].cols"
                :can-remove
                :can-sort
                :handle-drag-enter="
                  ($event: DragEvent) => handleDragEnter($event, rowIndex)
                "
                :handle-drag-start="
                  ($event: DragEvent) => handleDragStart($event, row.dataIndex)
                "
                :handle-drag-end
                :remove="row.remove"
              />
              <component
                v-else-if="outlets?.row"
                :is="outlets.row"
                :index="row.dataIndex"
                :row-header="showRowHeaders"
                :being-dragged="dragIndex === row.dataIndex"
                :is-drop-target="dropTarget === row.key"
                :label
                :cols="resolvedRows[rowIndex].cols"
                :can-remove
                :can-sort
                :handle-drag-enter="
                  ($event: DragEvent) => handleDragEnter($event, rowIndex)
                "
                :handle-drag-start="
                  ($event: DragEvent) => handleDragStart($event, row.dataIndex)
                "
                :handle-drag-end
                :remove="row.remove"
              />
              <template v-else>
                <template v-if="canSort">
                  <slot
                    v-if="slots['sort-wrapper']"
                    name="sort-wrapper"
                    :bindings="bindings.sortWrapper"
                    :handle-drag-start="
                      ($event: DragEvent) =>
                        handleDragStart($event, row.dataIndex)
                    "
                    :handle-drag-end
                    :handle-drag-enter="
                      ($event: DragEvent) => handleDragEnter($event, rowIndex)
                    "
                  />
                  <component
                    v-else-if="outlets?.['sort-wrapper']"
                    :is="outlets['sort-wrapper']"
                    :bindings="bindings.sortWrapper"
                    :handle-drag-start="
                      ($event: DragEvent) =>
                        handleDragStart($event, row.dataIndex)
                    "
                    :handle-drag-end
                    :handle-drag-enter="
                      ($event: DragEvent) => handleDragEnter($event, rowIndex)
                    "
                  />
                  <div v-else v-bind="bindings.sortWrapper">
                    <slot
                      v-if="slots.sort"
                      name="sort"
                      :bindings="bindings.sort(rowIndex)"
                      :handle-drag-start="
                        ($event: DragEvent) =>
                          handleDragStart($event, row.dataIndex)
                      "
                      :handle-drag-end
                      :handle-drag-enter="
                        ($event: DragEvent) => handleDragEnter($event, rowIndex)
                      "
                    />
                    <component
                      v-else-if="outlets?.sort"
                      :is="outlets.sort"
                      :bindings="bindings.sort(rowIndex)"
                      :handle-drag-start="
                        ($event: DragEvent) =>
                          handleDragStart($event, row.dataIndex)
                      "
                      :handle-drag-end
                      :handle-drag-enter="
                        ($event: DragEvent) => handleDragEnter($event, rowIndex)
                      "
                    />
                    <VfButton
                      v-else
                      :name="`${id}__sort_${rowIndex}`"
                      :icon="sortIcon"
                      v-bind="bindings.sort(rowIndex)"
                      :draggable="true"
                      :layout="false"
                      detached
                      @dragstart="handleDragStart($event, row.dataIndex)"
                      @dragend="handleDragEnd"
                      @dragenter="
                        ($event: DragEvent) => handleDragEnter($event, rowIndex)
                      "
                    />
                  </div>
                </template>

                <template v-if="showRowHeaders">
                  <slot
                    v-if="slots['row-header']"
                    name="row-header"
                    :label
                    :bindings="bindings.rowHeader"
                  />
                  <component
                    v-else-if="outlets?.['row-header']"
                    :is="outlets['row-header']"
                    :label
                    :bindings="bindings.rowHeader"
                  />
                  <div v-else :id="row.id" v-bind="bindings.rowHeader">
                    {{ label }}
                  </div>
                </template>
                <div v-else class="sr-only" :id="row.id">{{ label }}</div>

                <!--
                  Cells iterate `resolvedRows` through the reactive computed
                  (not the v-for destructured `cols`) so the row component's
                  slot content tracks it and re-renders when columns change
                  after the row has mounted (e.g. async-loaded cols).
                -->
                <template
                  v-for="r in resolvedRows[rowIndex].cols"
                  :key="r.props.name"
                >
                  <slot
                    v-if="slots.cell"
                    name="cell"
                    :component="r.component"
                    :props="r.props"
                    :bindings="bindings.cell"
                    :handle-drag-enter="
                      ($event: DragEvent) => handleDragEnter($event, rowIndex)
                    "
                  />
                  <component
                    v-else-if="outlets?.cell"
                    :is="outlets.cell"
                    :component="r.component"
                    :props="r.props"
                    :bindings="bindings.cell"
                    :handle-drag-enter="
                      ($event: DragEvent) => handleDragEnter($event, rowIndex)
                    "
                  />
                  <div
                    v-else
                    v-bind="bindings.cell"
                    @dragenter="
                      ($event: DragEvent) => handleDragEnter($event, rowIndex)
                    "
                  >
                    <component :is="r.component" v-bind="r.props" />
                  </div>
                </template>

                <template v-if="canRemove">
                  <slot
                    v-if="slots['remove-wrapper']"
                    name="remove-wrapper"
                    :bindings="bindings.removeWrapper"
                    :handle-remove="row.remove"
                  />
                  <component
                    v-else-if="outlets?.['remove-wrapper']"
                    :is="outlets['remove-wrapper']"
                    :bindings="bindings.removeWrapper"
                    :handle-remove="row.remove"
                  />
                  <div v-else v-bind="bindings.removeWrapper">
                    <slot
                      v-if="slots.remove"
                      name="remove"
                      :bindings="bindings.remove(rowIndex)"
                      :handle-remove="row.remove"
                    />
                    <component
                      v-else-if="outlets?.remove"
                      :is="outlets.remove"
                      :bindings="bindings.remove(rowIndex)"
                      :handle-remove="row.remove"
                    />
                    <VfButton
                      v-else
                      :name="`${id}__remove_${rowIndex}`"
                      :text="removeLabel"
                      :icon="removeIcon"
                      :layout="false"
                      detached
                      v-bind="bindings.remove(rowIndex)"
                      @click.prevent="row.remove"
                    />
                  </div>
                </template>
              </template>
            </template>
          </component>
        </div>
      </div>

      <template v-if="!showColHeaders">
        <template v-for="(header, i) in headers" :key="header.id || i">
          <div v-if="'label' in header" class="sr-only" :id="header.id">
            {{ header.label }}
          </div>
        </template>
      </template>

      <template v-if="canAdd">
        <slot
          name="add"
          :label="addLabel!"
          :bindings="bindings.add"
          :handle-add
        >
          <component
            v-if="outlets?.add"
            :is="outlets.add"
            :label="addLabel!"
            :bindings="bindings.add"
            :handle-add
          />
          <VfButton
            v-else
            :layout="false"
            detached
            hide-label
            name="add"
            :text="addLabel"
            :icon="addIcon"
            v-bind="bindings.add"
            @click.prevent="handleAdd"
          />
        </slot>
      </template>

      <component :is="'style'" :nonce.attr="nonce">
        .{{ gridClass }} { grid-template-columns: {{ gridColumns }}; }
      </component>
    </VfLayout>
  </slot>
</template>
