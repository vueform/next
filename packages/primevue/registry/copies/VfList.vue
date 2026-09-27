<script setup lang="ts">
/**
 * Local copy of VfList of Vueform. How to customize it:
 * https://primevue.vueform.com/guide/components#building-on-blueprints
 */

import {
  type VfListEmits,
  type VfListProps,
  type VfListSlots,
  defaults,
  blueprint,
} from '@vueform/primevue/components/VfList'
import { useBlueprint, useLocale, defineEvents } from '@vueform/primevue'
import '@vueform/primevue/list.css'

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

const { api, parts, classes, context, expose, outlets, useClasses } =
  useBlueprint(blueprint, props, events, slots)

useClasses(({ props }) => ({
  container: 'vf-list',
  items: 'vf-list-items',
  item: (beingDragged: boolean, isDropTarget: boolean) => ({
    'vf-list-item': true,
    'vf-wrapped': props.wrap,
    'vf-dragging': beingDragged,
    'vf-drop-target': isDropTarget,
  }),
  element: 'vf-list-element',
  sort: 'vf-list-sort',
  remove: 'vf-list-remove',
  placeholder: 'vf-list-placeholder',
  add: 'vf-list-add',
}))

const { t } = useLocale()

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
  placeholderId,
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

// @todo: template a11y
</script>

<template>
  <slot name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <VfLayout v-else>
      <slot
        v-if="items.length === 0"
        name="placeholder"
        :class="classes.placeholder"
        v-bind="parts.placeholder"
      >
        <component
          v-if="outlets?.placeholder"
          :is="outlets.placeholder"
          :class="classes.placeholder"
          v-bind="parts.placeholder"
        />
        <div
          v-else-if="placeholder"
          :id="placeholderId"
          :class="classes.placeholder"
          role="status"
          v-bind="parts.placeholder"
        >
          {{ placeholder }}
        </div>
      </slot>

      <div
        v-else
        ref="list"
        :class="classes.items"
        v-bind="parts.items"
        @dragover="handleWrapperDragOver"
        @drop="handleDrop"
      >
        <template v-for="({ id, index }, position) in items" :key="id">
          <slot
            name="item"
            :index
            :being-dragged="dragIndex === index"
            :is-drop-target="dropTarget === id"
            :handle-drag-enter="
              ($event: DragEvent) => handleDragEnter($event, position)
            "
            :handle-drag-start="
              ($event: DragEvent) => handleDragStart($event, index)
            "
            :handle-drag-end
            :handle-remove="() => handleRemove(index)"
            :class="classes.item(dragIndex === index, dropTarget === id)"
            v-bind="parts.item?.(dragIndex === index, dropTarget === id)"
          >
            <component
              v-if="outlets?.item"
              :is="outlets.item"
              :index
              :being-dragged="dragIndex === index"
              :is-drop-target="dropTarget === id"
              :handle-drag-enter="
                ($event: DragEvent) => handleDragEnter($event, position)
              "
              :handle-drag-start="
                ($event: DragEvent) => handleDragStart($event, index)
              "
              :handle-drag-end
              :handle-remove="() => handleRemove(index)"
              :class="classes.item(dragIndex === index, dropTarget === id)"
              v-bind="parts.item?.(dragIndex === index, dropTarget === id)"
            />
            <div
              v-else
              :class="classes.item(dragIndex === index, dropTarget === id)"
              v-bind="parts.item?.(dragIndex === index, dropTarget === id)"
              @dragenter="handleDragEnter($event, position)"
            >
              <slot
                v-if="canSort"
                name="sort"
                :handle-drag-start="
                  ($event: DragEvent) => handleDragStart($event, index)
                "
                :handle-drag-end
                :class="classes.sort"
                v-bind="parts.sort"
              >
                <component
                  v-if="outlets?.sort"
                  :is="outlets.sort"
                  :handle-drag-start="
                    ($event: DragEvent) => handleDragStart($event, index)
                  "
                  :handle-drag-end
                  :class="classes.sort"
                  v-bind="parts.sort"
                />
                <VfButton
                  v-else
                  :class="classes.sort"
                  :name="`${id}__sort_${index}`"
                  :icon="sortIcon"
                  :layout="false"
                  :draggable="true"
                  detached
                  v-bind="parts.sort"
                  @dragstart="handleDragStart($event, index)"
                  @dragend="handleDragEnd"
                />
              </slot>

              <div :class="classes.element" v-bind="parts.element">
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
                :handle-remove="() => handleRemove(index)"
                :class="classes.remove"
                v-bind="parts.remove"
              >
                <component
                  v-if="outlets?.remove"
                  :is="outlets.remove"
                  :handle-remove="() => handleRemove(index)"
                  :class="classes.remove"
                  v-bind="parts.remove"
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
                  :class="classes.remove"
                  v-bind="parts.remove"
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
          :submit="false"
          name="add"
          :text="addLabel"
          :icon="addIcon"
          :class="classes.add"
          :aria-label="addLabel ? undefined : t('sr_list_add')"
          :aria-describedby="
            items.length === 0 && placeholder ? placeholderId : undefined
          "
          v-bind="parts.add"
          @click.prevent="handleAdd"
        />
      </slot>
    </VfLayout>
  </slot>
</template>
