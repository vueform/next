<script setup lang="ts">
/**
 * Local copy of VfList of Vueform. How to customize it:
 * https://ui.vueform.com/guide/components#building-on-blueprints
 */

import { useBlueprint, useLocale, defineEvents } from '@vueform/ui'
import {
  defaults,
  blueprint,
  type VfListEmits,
  type VfListProps,
  type VfListSlots,
} from '@vueform/ui/components/VfList'

import '@vueform/ui/list.css'

defineOptions({
  name: 'VfList',
  element: true,
  inheritAttrs: false,
  children: (props) => {
    let prototype: Record<string, any> = {}

    if (props.schema) {
      if (props.flat) {
        const values = Array.isArray(props.schema)
          ? props.schema
          : Object.values(props.schema)

        if (values.length === 1) {
          const el = values[0] as Record<string, any>
          prototype = el.type === 'group' ? { ...el, nested: true } : el
        } else {
          prototype = {
            type: 'group',
            nested: true,
            schema: props.schema,
          }
        }
      } else {
        prototype = {
          type: 'group',
          nested: true,
          schema: props.schema,
        }
      }
    }

    const count = Math.max(0, Number(props.initial ?? 1) || 0)
    const entries: Record<string, Record<string, any>> = {}
    for (let i = 0; i < count; i++) {
      entries[String(i)] = prototype
    }

    return { array: true, entries }
  },
})
defineEmits<VfListEmits>()

const props = withDefaults(defineProps<VfListProps>(), defaults)
const events = defineEvents<VfListEmits>()
const slots = defineSlots<VfListSlots>()

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

useClasses(() => ({
  root: 'vf-list',
  items: 'vf-list-items',
  item: () => 'vf-list-item',
  element: 'vf-list-element',
  sort: () => 'vf-list-sort',
  remove: () => 'vf-list-remove',
  placeholder: 'vf-list-placeholder',
  add: 'vf-list-add',
}))

useModifiers(({ props }) => ({
  item: (beingDragged: boolean, isDropTarget: boolean) => ({
    'data-wrapped': props.wrap ? '' : undefined,
    'data-dragging': beingDragged ? '' : undefined,
    'data-drop-target': isDropTarget ? '' : undefined,
  }),
}))

useA11y(({ placeholderId, addLabel, removeLabel, items, placeholder }) => ({
  items: {
    role: 'list',
  },
  item: (_beingDragged: boolean, _isDropTarget: boolean) => ({
    role: 'listitem' as const,
  }),
  placeholder: {
    id: placeholderId.value,
    role: 'status',
  },
  add: {
    'aria-label': addLabel.value ? undefined : t('sr_list_add'),
    'aria-describedby':
      items.value.length === 0 && placeholder.value
        ? placeholderId.value
        : undefined,
  },
  sort: (index: number) => ({
    'aria-label': t('sr_list_sort', { index: index + 1 }),
  }),
  remove: (index: number) => ({
    'aria-label': removeLabel.value
      ? undefined
      : t('sr_list_remove', { index: index + 1 }),
  }),
}))

const {
  items,
  dragIndex,
  dropTarget,
  prototypeComponent,
  prototype,
  addLabel,
  removeLabel,
  addIcon,
  removeIcon,
  sortIcon,
  placeholder,
  canAdd,
  canRemove,
  canSort,
  handleRemove,
  handleAdd,
  handleDragEnter,
  handleDragStart,
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
      <slot
        v-if="items.length === 0"
        name="placeholder"
        :bindings="bindings.placeholder"
      >
        <component
          v-if="outlets?.placeholder"
          :is="outlets.placeholder"
          :bindings="bindings.placeholder"
        />
        <div v-else-if="placeholder" v-bind="bindings.placeholder">
          {{ placeholder }}
        </div>
      </slot>

      <div
        v-else
        ref="list"
        v-bind="bindings.items"
        @dragover="handleWrapperDragOver"
        @drop="handleDrop"
      >
        <template v-for="({ id, index }, position) in items" :key="id">
          <slot
            name="item"
            :index
            :being-dragged="dragIndex === index"
            :is-drop-target="dropTarget === id"
            :bindings="bindings.item(dragIndex === index, dropTarget === id)"
            :handle-drag-enter="
              ($event: DragEvent) => handleDragEnter($event, position)
            "
            :handle-drag-start="
              ($event: DragEvent) => handleDragStart($event, index)
            "
            :handle-drag-end
            :handle-remove="() => handleRemove(index)"
          >
            <component
              v-if="outlets?.item"
              :is="outlets.item"
              :index
              :being-dragged="dragIndex === index"
              :is-drop-target="dropTarget === id"
              :bindings="bindings.item(dragIndex === index, dropTarget === id)"
              :handle-drag-enter="
                ($event: DragEvent) => handleDragEnter($event, position)
              "
              :handle-drag-start="
                ($event: DragEvent) => handleDragStart($event, index)
              "
              :handle-drag-end
              :handle-remove="() => handleRemove(index)"
            />
            <div
              v-else
              v-bind="bindings.item(dragIndex === index, dropTarget === id)"
              @dragenter="handleDragEnter($event, position)"
            >
              <slot
                v-if="canSort"
                name="sort"
                :bindings="bindings.sort(index)"
                :handle-drag-start="
                  ($event: DragEvent) => handleDragStart($event, index)
                "
                :handle-drag-end
              >
                <component
                  v-if="outlets?.sort"
                  :is="outlets.sort"
                  :bindings="bindings.sort(index)"
                  :handle-drag-start="
                    ($event: DragEvent) => handleDragStart($event, index)
                  "
                  :handle-drag-end
                />
                <VfButton
                  v-else
                  :name="`${id}__sort_${index}`"
                  :icon="sortIcon"
                  :layout="false"
                  :draggable="true"
                  detached
                  v-bind="bindings.sort(index)"
                  @dragstart="handleDragStart($event, index)"
                  @dragend="handleDragEnd"
                />
              </slot>

              <div v-bind="bindings.element">
                <slot :component="prototypeComponent" :props="prototype" :index>
                  <component
                    v-if="outlets?.default"
                    :is="outlets.default"
                    :component="prototypeComponent"
                    :props="prototype"
                    :index
                  />
                  <component
                    v-else
                    :is="prototypeComponent"
                    v-bind="prototype"
                    :name="index"
                  />
                </slot>
              </div>

              <slot
                v-if="canRemove"
                name="remove"
                :bindings="bindings.remove(index)"
                :handle-remove="() => handleRemove(index)"
              >
                <component
                  v-if="outlets?.remove"
                  :is="outlets.remove"
                  :bindings="bindings.remove(index)"
                  :handle-remove="() => handleRemove(index)"
                />
                <VfButton
                  v-else
                  :layout="false"
                  hide-label
                  :submit="false"
                  detached
                  :name="`${id}__remove_${index}`"
                  :text="removeLabel"
                  :icon="removeIcon"
                  v-bind="bindings.remove(index)"
                  @click.prevent="handleRemove(index)"
                />
              </slot>
            </div>
          </slot>
        </template>
      </div>

      <slot
        v-if="canAdd"
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
          :submit="false"
          name="add"
          :text="addLabel"
          :icon="addIcon"
          v-bind="bindings.add"
          @click.prevent="handleAdd"
        />
      </slot>
    </VfLayout>
  </slot>
</template>
