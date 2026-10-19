<script setup lang="ts">
import {
  blueprint,
  defaults,
  normalizeSourceItems,
  resolveItemProp,
} from '#src/blueprints/matrix'
import { useBlueprint, useLocale } from '#src/composables'
import { defineEvents } from '#src/helpers'
import { isPlainObject } from '#src/utils'

import type { VfMatrixEmits, VfMatrixProps, VfMatrixSlots } from './types'

defineOptions({
  name: 'VfMatrix',
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
defineEmits<VfMatrixEmits>()

const props = withDefaults(defineProps<VfMatrixProps>(), defaults)
const events = defineEvents<VfMatrixEmits>()
const slots = defineSlots<VfMatrixSlots>()

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
