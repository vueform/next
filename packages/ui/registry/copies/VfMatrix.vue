<script setup lang="ts">
/**
 * Local copy of VfMatrix of Vueform. How to customize it:
 * https://ui.vueform.com/guide/components#building-on-blueprints
 */

import {
  useBlueprint,
  useLocale,
  defineEvents,
  isPlainObject,
} from '@vueform/ui'
import {
  normalizeSourceItems,
  resolveItemProp,
} from '@vueform/ui/blueprints/matrix'
import {
  blueprint,
  defaults,
  type VfMatrixEmits,
  type VfMatrixProps,
  type VfMatrixSlots,
} from '@vueform/ui/components/VfMatrix'

import '@vueform/ui/matrix.css'
import '@vueform/ui/tabular.css'

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
              />
              <component
                v-else-if="outlets?.row"
                :is="outlets.row"
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
              />
              <template v-else>
                <template v-if="canSort">
                  <slot
                    v-if="slots.sortWrapper"
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
                  />
                  <component
                    v-else-if="outlets?.sortWrapper"
                    :is="outlets.sortWrapper"
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
                  />
                  <div
                    v-else
                    :class="classes.sortWrapper"
                    v-bind="parts.sortWrapper"
                  >
                    <slot
                      v-if="slots.sort"
                      name="sort"
                      :class="classes.sort"
                      :handle-drag-start="
                        ($event: DragEvent) =>
                          handleDragStart($event, row.dataIndex)
                      "
                      :handle-drag-end
                      :handle-drag-enter="
                        ($event: DragEvent) => handleDragEnter($event, rowIndex)
                      "
                      v-bind="parts.sort"
                    />
                    <component
                      v-else-if="outlets?.sort"
                      :is="outlets.sort"
                      :class="classes.sort"
                      :handle-drag-start="
                        ($event: DragEvent) =>
                          handleDragStart($event, row.dataIndex)
                      "
                      :handle-drag-end
                      :handle-drag-enter="
                        ($event: DragEvent) => handleDragEnter($event, rowIndex)
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
                        ($event: DragEvent) => handleDragEnter($event, rowIndex)
                      "
                    />
                  </div>
                </template>

                <template v-if="showRowHeaders">
                  <slot
                    v-if="slots.rowHeader"
                    name="rowHeader"
                    :label
                    :class="classes.rowHeader"
                    v-bind="parts.rowHeader"
                  />
                  <component
                    v-else-if="outlets?.rowHeader"
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
                    :handle-drag-enter="
                      ($event: DragEvent) => handleDragEnter($event, rowIndex)
                    "
                    :props="r.props"
                    v-bind="parts.cell"
                  />
                  <component
                    v-else-if="outlets?.cell"
                    :is="outlets.cell"
                    :component="r.component"
                    :handle-drag-enter="
                      ($event: DragEvent) => handleDragEnter($event, rowIndex)
                    "
                    :props="r.props"
                    v-bind="parts.cell"
                  />
                  <div
                    v-else
                    :class="classes.cell"
                    v-bind="parts.cell"
                    @dragenter="
                      ($event: DragEvent) => handleDragEnter($event, rowIndex)
                    "
                  >
                    <component :is="r.component" v-bind="r.props" />
                  </div>
                </template>

                <template v-if="canRemove">
                  <slot
                    v-if="slots.removeWrapper"
                    name="removeWrapper"
                    :handle-remove="row.remove"
                    :class="classes.removeWrapper"
                    v-bind="parts.removeWrapper"
                  />
                  <component
                    v-else-if="outlets?.removeWrapper"
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
                      v-if="slots.remove"
                      name="remove"
                      :handle-remove="row.remove"
                      :class="classes.remove"
                      v-bind="parts.remove"
                    />
                    <component
                      v-else-if="outlets?.remove"
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
