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
const { api, parts, classes, context, expose, outlets, useClasses } =
  useBlueprint(blueprint, props, events, slots)

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
    'vf-scrollable': !!props.scrollable,
    [gridClass.value]: true,
  },
  header: 'vf-matrix-header',
  colHeader: {
    'vf-matrix-col-header': true,
    'vf-sticky': !!props.stickyCols,
  },
  row: (beingDragged: boolean, isDropTarget: boolean) => ({
    'vf-matrix-row': true,
    'vf-dragging': beingDragged,
    'vf-drop-target': isDropTarget,
  }),
  rowHeader: {
    'vf-matrix-row-header': true,
    'vf-sticky': !!props.stickyRows,
  },
  cell: 'vf-matrix-cell',
  sortWrapper: 'vf-matrix-row-sort',
  sort: 'vf-matrix-sort',
  removeWrapper: 'vf-matrix-row-remove',
  remove: 'vf-matrix-remove',
  add: 'vf-matrix-add',
}))

const { t } = useLocale()

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
  UnwrapEntryRef,
  WidenScalar,
} from '@vueform/ui'

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
        :class="classes.grid"
        v-bind="parts.grid"
        @dragover="handleWrapperDragOver"
        @drop="handleDrop"
      >
        <slot
          v-if="showColHeaders"
          name="header"
          :headers
          :class="classes.header"
          v-bind="parts.header"
        >
          <component
            v-if="outlets?.header"
            :is="outlets.header"
            :headers
            :class="classes.header"
            v-bind="parts.header"
          />
          <div v-else :class="classes.header" v-bind="parts.header">
            <template
              v-for="({ id, label, available }, i) in headers"
              :key="id || i"
            >
              <slot
                name="colHeader"
                v-if="!id || available.value"
                :id
                :label
                :class="classes.colHeader"
                v-bind="parts.colHeader"
              >
                <component
                  v-if="outlets?.colHeader"
                  :is="outlets.colHeader"
                  :id
                  :label
                  :class="classes.colHeader"
                  v-bind="parts.colHeader"
                />
                <div
                  v-else
                  :class="classes.colHeader"
                  :id
                  v-bind="parts.colHeader"
                >
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
          :class="
            classes.row(dragIndex === row.dataIndex, dropTarget === row.key)
          "
          v-bind="parts.row"
        >
          <component
            :is="row.component"
            v-bind="row.props"
            :class="
              classes.row(dragIndex === row.dataIndex, dropTarget === row.key)
            "
          >
            <template #[row.slot]="{ label }">
              <slot
                name="row"
                :index="row.dataIndex"
                :row-header="showRowHeaders"
                :being-dragged="dragIndex === row.dataIndex"
                :is-drop-target="dropTarget === row.key"
                :handle-drag-enter="
                  ($event: DragEvent) => handleDragEnter($event, rowIndex)
                "
                :handle-drag-start="
                  ($event: DragEvent) => handleDragStart($event, row.dataIndex)
                "
                :handle-drag-end
                :label
                :cols="resolvedRows[rowIndex].cols"
                :remove="row.remove"
                :can-remove
                :can-sort
                :class="
                  classes.row(
                    dragIndex === row.dataIndex,
                    dropTarget === row.key
                  )
                "
                v-bind="parts.row"
              >
                <component
                  v-if="outlets?.row"
                  :is="outlets.row"
                  :index="row.dataIndex"
                  :row-header="showRowHeaders"
                  :being-dragged="dragIndex === row.dataIndex"
                  :is-drop-target="dropTarget === row.key"
                  :handle-drag-enter="
                    ($event: DragEvent) => handleDragEnter($event, rowIndex)
                  "
                  :handle-drag-start="
                    ($event: DragEvent) =>
                      handleDragStart($event, row.dataIndex)
                  "
                  :handle-drag-end
                  :label
                  :cols="resolvedRows[rowIndex].cols"
                  :remove="row.remove"
                  :can-remove
                  :can-sort
                  :class="
                    classes.row(
                      dragIndex === row.dataIndex,
                      dropTarget === row.key
                    )
                  "
                  v-bind="parts.row"
                />
                <template v-else>
                  <template v-if="canSort">
                    <slot
                      name="sortWrapper"
                      :handle-drag-start="
                        ($event: DragEvent) =>
                          handleDragStart($event, row.dataIndex)
                      "
                      :handle-drag-end
                      :handle-drag-enter="
                        ($event: DragEvent) => handleDragEnter($event, rowIndex)
                      "
                      :class="classes.sortWrapper"
                      v-bind="parts.sortWrapper"
                    >
                      <component
                        v-if="outlets?.sortWrapper"
                        :is="outlets.sortWrapper"
                        :handle-drag-start="
                          ($event: DragEvent) =>
                            handleDragStart($event, row.dataIndex)
                        "
                        :handle-drag-end
                        :handle-drag-enter="
                          ($event: DragEvent) =>
                            handleDragEnter($event, rowIndex)
                        "
                        :class="classes.sortWrapper"
                        v-bind="parts.sortWrapper"
                      />
                      <div
                        v-else
                        :class="classes.sortWrapper"
                        v-bind="parts.sortWrapper"
                      >
                        <slot
                          name="sort"
                          :class="classes.sort"
                          :handle-drag-start="
                            ($event: DragEvent) =>
                              handleDragStart($event, row.dataIndex)
                          "
                          :handle-drag-end
                          :handle-drag-enter="
                            ($event: DragEvent) =>
                              handleDragEnter($event, rowIndex)
                          "
                          v-bind="parts.sort"
                        >
                          <component
                            v-if="outlets?.sort"
                            :is="outlets.sort"
                            :class="classes.sort"
                            :handle-drag-start="
                              ($event: DragEvent) =>
                                handleDragStart($event, row.dataIndex)
                            "
                            :handle-drag-end
                            :handle-drag-enter="
                              ($event: DragEvent) =>
                                handleDragEnter($event, rowIndex)
                            "
                            v-bind="parts.sort"
                          />
                          <VfButton
                            v-else
                            :name="`${id}__sort_${rowIndex}`"
                            :icon="sortIcon"
                            :class="classes.sort"
                            v-bind="parts.sort"
                            :draggable="true"
                            :layout="false"
                            detached
                            @dragstart="handleDragStart($event, row.dataIndex)"
                            @dragend="handleDragEnd"
                            @dragenter="
                              ($event: DragEvent) =>
                                handleDragEnter($event, rowIndex)
                            "
                          />
                        </slot>
                      </div>
                    </slot>
                  </template>

                  <template v-if="showRowHeaders">
                    <slot
                      name="rowHeader"
                      :label
                      :class="classes.rowHeader"
                      v-bind="parts.rowHeader"
                    >
                      <component
                        v-if="outlets?.rowHeader"
                        :is="outlets.rowHeader"
                        :label
                        :class="classes.rowHeader"
                        v-bind="parts.rowHeader"
                      />
                      <div
                        v-else
                        :class="classes.rowHeader"
                        :id="row.id"
                        v-bind="parts.rowHeader"
                      >
                        {{ label }}
                      </div>
                    </slot>
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
                      name="cell"
                      :component="r.component"
                      :handle-drag-enter="
                        ($event: DragEvent) => handleDragEnter($event, rowIndex)
                      "
                      :props="r.props"
                      v-bind="parts.cell"
                    >
                      <component
                        v-if="outlets?.cell"
                        :is="outlets.cell"
                        :component="r.component"
                        :handle-drag-enter="
                          ($event: DragEvent) =>
                            handleDragEnter($event, rowIndex)
                        "
                        :props="r.props"
                        v-bind="parts.cell"
                      />
                      <div
                        v-else
                        :class="classes.cell"
                        v-bind="parts.cell"
                        @dragenter="
                          ($event: DragEvent) =>
                            handleDragEnter($event, rowIndex)
                        "
                      >
                        <component :is="r.component" v-bind="r.props" />
                      </div>
                    </slot>
                  </template>

                  <template v-if="canRemove">
                    <slot
                      name="removeWrapper"
                      :handle-remove="row.remove"
                      :class="classes.removeWrapper"
                      v-bind="parts.removeWrapper"
                    >
                      <component
                        v-if="outlets?.removeWrapper"
                        :is="outlets.removeWrapper"
                        :handle-remove="row.remove"
                        :class="classes.removeWrapper"
                        v-bind="parts.removeWrapper"
                      />
                      <div
                        v-else
                        :class="classes.removeWrapper"
                        v-bind="parts.removeWrapper"
                      >
                        <slot
                          name="remove"
                          :handle-remove="row.remove"
                          :class="classes.remove"
                          v-bind="parts.remove"
                        >
                          <component
                            v-if="outlets?.remove"
                            :is="outlets.remove"
                            :handle-remove="row.remove"
                            :class="classes.remove"
                            v-bind="parts.remove"
                          />
                          <VfButton
                            v-else
                            :class="classes.remove"
                            :name="`${id}__remove_${rowIndex}`"
                            :text="removeLabel"
                            :icon="removeIcon"
                            :layout="false"
                            detached
                            v-bind="parts.remove"
                            @click.prevent="row.remove"
                          />
                        </slot>
                      </div>
                    </slot>
                  </template>
                </template>
              </slot>
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
          :handle-add
          :label="addLabel!"
          :class="classes.add"
          v-bind="parts.add"
        >
          <component
            v-if="outlets?.add"
            :is="outlets.add"
            :handle-add
            :label="addLabel!"
            :class="classes.add"
            v-bind="parts.add"
          />
          <VfButton
            v-else
            :layout="false"
            detached
            hide-label
            name="add"
            :text="addLabel"
            :icon="addIcon"
            :class="classes.add"
            :aria-label="addLabel ? undefined : t('sr_matrix_add')"
            v-bind="parts.add"
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
