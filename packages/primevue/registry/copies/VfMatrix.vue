<script setup lang="ts">
/**
 * Local copy of VfMatrix of Vueform. How to customize it:
 * https://primevue.vueform.com/guide/components#building-on-blueprints
 */

import {
  blueprint,
  defaults,
  normalizeSourceItems,
  resolveItemProp,
} from '@vueform/primevue/blueprints/matrix'
import {
  useBlueprint,
  useLocale,
  defineEvents,
  isPlainObject,
} from '@vueform/primevue'
import type {
  VfMatrixEmits,
  VfMatrixProps,
  VfMatrixSlots,
} from '@vueform/primevue/components/VfMatrix'
import '@vueform/primevue/matrix.css'

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

const { api, parts, classes, context, expose, outlets, useClasses } =
  useBlueprint(blueprint, props, events, slots)

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
            <template v-for="{ id, label, available } in headers">
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
          v-show="row.available.value"
          :class="
            classes.row(dragIndex === row.dataIndex, dropTarget === row.key)
          "
          :key="row.key"
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
        <template v-for="header in headers">
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
