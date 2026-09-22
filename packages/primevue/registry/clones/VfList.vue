<script setup lang="ts">
/**
 * VfCloneName — a custom element created from Vueform's `list` blueprint.
 *
 * @see https://primevue.vueform.com/guide/components#building-on-blueprints
 */

import {
  defaults,
  blueprint,
  type ListApi,
  type ListClasses,
  type ListEmits,
  type ListExpose,
  type ListParts,
  type ListProps,
  type ListSlots,
} from '@vueform/primevue/blueprints/list'
import {
  useBlueprint,
  useLocale,
  defineEvents,
  type ClassValue,
  type DefineElementContext,
  type DomAttrsOf,
  type ElementName,
  type PartOf,
  type WidenProps,
} from '@vueform/primevue'
import '@vueform/primevue/list.css'
import type { Component, VNode } from 'vue'

/**
 * Prop definitions.
 *
 * @example
 *   custom?: any
 */
export interface VfCloneNameProps extends ListProps<
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
 * @see https://primevue.vueform.com/guide/event-handlers
 */
export interface VfCloneNameEmits extends ListEmits<VfCloneNameContext> {}

/**
 * Slot definitions.
 *
 * @example
 *   custom: (props: { prop1: any; prop2: any }) => import('vue').VNode[]
 *
 * @see https://primevue.vueform.com/guide/slots
 */
export interface VfCloneNameSlots extends ListSlots<VfCloneNameContext> {
  /**
   * Slot that replaces each list item wrapper. Receives drag state and event
   * handlers.
   *
   * @param props.class CSS classes for the item wrapper.
   * @param props.index The item's index.
   * @param props.beingDragged Whether this item is currently being dragged.
   * @param props.isDropTarget Whether this item is the current drop target.
   * @param props.handleDragEnter Handler for the drag enter event.
   * @param props.handleDragStart Handler for the drag start event.
   * @param props.handleDragEnd Handler for the drag end event.
   * @param props.handleRemove Handler to remove this list item.
   */
  item: (props: {
    class: ClassValue
    index: number
    beingDragged: boolean
    isDropTarget: boolean
    handleDragEnter: ($event: DragEvent) => void
    handleDragStart: ($event: DragEvent) => void
    handleDragEnd: () => void
    handleRemove: () => void
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
    handleDragStart: ($event: DragEvent) => void
    handleDragEnd: () => void
  }) => VNode[]

  /**
   * Slot that replaces the default element content within each list item.
   *
   * @param props.component The component name for the list item element.
   * @param props.props The props passed to the list item element.
   * @param props.index The element name/index for this item.
   */
  default: (props: {
    component?: string | Component
    props: Record<string, any>
    index: ElementName
  }) => VNode[]

  /**
   * Slot that replaces the remove button. Receives class and remove handler.
   *
   * @param props.class CSS classes for the remove button.
   * @param props.handleRemove Handler to remove this list item.
   */
  remove: (props: { class: ClassValue; handleRemove: () => void }) => VNode[]

  /**
   * Slot that replaces the placeholder element when the list is empty.
   *
   * @param props.class CSS classes for the placeholder element.
   */
  placeholder: (props: { class: ClassValue }) => VNode[]

  /**
   * Slot that replaces the add button. Receives class, add handler, and label.
   *
   * @param props.class CSS classes for the add button.
   * @param props.handleAdd Handler to add a new list item.
   * @param props.label The button label text.
   */
  add: (props: {
    class: ClassValue
    handleAdd: () => void
    label: any
  }) => VNode[]
}

/**
 * Part definitions.
 *
 * @example
 *   tag: import('@vueform/primevue').DomAttrsOf<'div'>
 *   component: import('@vueform/primevue').PartOf<'VfButton'>
 *
 * @see https://primevue.vueform.com/guide/parts
 */
export interface VfCloneNameParts extends ListParts {
  /**
   * The items container element.
   *
   * @tag div
   */
  items: DomAttrsOf<'div'>

  /**
   * Each list item wrapper. Receives drag state.
   *
   * @param beingDragged Whether this item is currently being dragged.
   * @param isDropTarget Whether this item is the current drop target.
   * @tag div
   */
  item: (beingDragged: boolean, isDropTarget: boolean) => DomAttrsOf<'div'>

  /**
   * The element wrapper within each list item.
   *
   * @tag div
   */
  element: DomAttrsOf<'div'>

  /**
   * The drag handle element.
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
   * The placeholder element displayed when the list is empty.
   *
   * @tag div
   */
  placeholder: DomAttrsOf<'div'>

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
 *   plain: import('@vueform/primevue').ClassValue
 *   dynamic: (arg1: any, arg2: any) => import('@vueform/primevue').ClassValue
 *
 * @see https://primevue.vueform.com/guide/classes
 */
export interface VfCloneNameClasses extends ListClasses {
  /**
   * The outer list container element.
   */
  container: ClassValue

  /**
   * The items container element.
   */
  items: ClassValue

  /**
   * Each list item wrapper. Receives drag state.
   *
   * @param beingDragged Whether this item is currently being dragged.
   * @param isDropTarget Whether this item is the current drop target.
   */
  item: (beingDragged: boolean, isDropTarget: boolean) => ClassValue

  /**
   * The element wrapper within each list item.
   */
  element: ClassValue

  /**
   * The drag handle element.
   */
  sort: ClassValue

  /**
   * The remove button element.
   */
  remove: ClassValue

  /**
   * The placeholder element displayed when the list is empty.
   */
  placeholder: ClassValue

  /**
   * The add button element.
   */
  add: ClassValue
}

/**
 * Custom exposed API members. Add props you return from useBlueprint's 5th
 * 'extend' callback.
 *
 * @example
 *   plain: string
 *   vueRef: import('vue').Ref<string>
 *   method: (arg1: any, arg2: any) => string
 *
 * @see https://primevue.vueform.com/guide/components#expose-interface
 */
export interface VfCloneNameExpose extends ListExpose {}

/**
 * The element's context — the object slots, outlets, and event handlers receive
 * (`context$`). Its shape is derived from the blueprint and the interfaces
 * above — customize those; don't extend or edit this one.
 */
export interface VfCloneNameContext<
  TProps extends WidenProps<VfCloneNameProps, ListProps<string>> =
    VfCloneNameProps,
> extends DefineElementContext<
  TProps,
  VfCloneNameEmits,
  VfCloneNameSlots,
  VfCloneNameParts,
  VfCloneNameClasses,
  VfCloneNameExpose,
  ListApi<TProps>
> {}

defineOptions({
  name: 'VfCloneName',
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
defineEmits<VfCloneNameEmits>()

const props = withDefaults(defineProps<VfCloneNameProps>(), {
  ...defaults,
  type: '__TYPE__',
})
const events = defineEvents<VfCloneNameEmits>()
const slots = defineSlots<VfCloneNameSlots>()

/**
 * Extend the element's API by passing a 5th 'extend' callback to useBlueprint —
 * whatever it returns merges into the api / expose (declare the members on
 * VfCloneNameExpose above).
 *
 * @example
 *   useBlueprint(blueprint, props, events, slots, () => ({
 *     plain: '',
 *     vueRef: ref(''),
 *     method: (arg1: any, arg2: any) => '',
 *   }))
 *
 * @see https://primevue.vueform.com/guide/components#extending-the-logic
 */
const { api, parts, classes, context, expose, outlets, useClasses } =
  useBlueprint(blueprint, props, events, slots)

/**
 * The element's own classes, per part — reactive via the callback's api refs.
 * The class keys come from VfCloneNameClasses above.
 *
 * @see https://primevue.vueform.com/guide/classes
 */
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

<script lang="ts">
import type {
  ArrayModel,
  DefineRegistryEntry,
  EntryPropOf,
  EntrySchemaOf,
  FlattenedListModel,
  IsAny,
  SchemaToModel,
} from '@vueform/primevue'

type ListModelOf<TEntry> =
  IsAny<EntryPropOf<TEntry, 'flat'>> extends true
    ? ArrayModel
    : EntryPropOf<TEntry, 'flat'> extends true
      ? FlattenedListModel<EntrySchemaOf<TEntry>>[]
      : SchemaToModel<EntrySchemaOf<TEntry>>[]

type EntryProps<TEntry> = Omit<VfCloneNameProps, 'modelValue'> & {
  modelValue?: ListModelOf<TEntry>
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
