<script setup lang="ts">
/**
 * VfCloneName — a custom element created from Vueform's `list` blueprint.
 *
 * @see https://ui.vueform.com/guide/components#building-on-blueprints
 */

import {
  useBlueprint,
  useI18n,
  defineEvents,
  type ClassValue,
  type DefineElementContext,
  type DomAttrsOf,
  type ElementName,
  type PartOf,
  type WidenProps,
} from '@vueform/ui'
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
} from '@vueform/ui/blueprints/list'

import '@vueform/ui/list.css'
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
 * @see https://ui.vueform.com/guide/event-handlers
 */
export interface VfCloneNameEmits extends ListEmits<VfCloneNameContext> {}

/**
 * Slot definitions.
 *
 * @example
 *   custom: (props: { prop1: any; prop2: any }) => import('vue').VNode[]
 *
 * @see https://ui.vueform.com/guide/slots
 */
export interface VfCloneNameSlots extends ListSlots<VfCloneNameContext> {
  /**
   * Slot that replaces each list item wrapper. Receives drag state and event
   * handlers.
   *
   * @param scope The item slot's params.
   */
  item: (scope: {
    /**
     * The item's index.
     */
    index: number

    /**
     * Whether this item is currently being dragged.
     */
    beingDragged: boolean

    /**
     * Whether this item is the current drop target.
     */
    isDropTarget: boolean

    /**
     * The item wrapper's resolved bindings (part overrides, drag markers,
     * listitem role); apply with `v-bind`.
     */
    bindings: VfListResolvedBindings['item']

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
     * Handler to remove this list item.
     */
    handleRemove: () => void
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
    bindings: VfListResolvedBindings['sort']

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
   * Slot that replaces the default element content within each list item.
   *
   * @param scope The default slot's params.
   */
  default: (scope: {
    /**
     * The component name for the list item element.
     */
    component?: string | Component

    /**
     * The props passed to the list item element.
     */
    props: Record<string, any>

    /**
     * The element name/index for this item.
     */
    index: ElementName
  }) => VNode[]

  /**
   * Slot that replaces the remove button. Receives the button's bindings and
   * the remove handler.
   *
   * @param scope The remove slot's params.
   */
  remove: (scope: {
    /**
     * The remove button's resolved bindings (part overrides, localized
     * aria-label fallback); apply with `v-bind`.
     */
    bindings: VfListResolvedBindings['remove']

    /**
     * Handler to remove this list item.
     */
    handleRemove: () => void
  }) => VNode[]

  /**
   * Slot that replaces the placeholder element when the list is empty.
   *
   * @param scope The placeholder slot's params.
   */
  placeholder: (scope: {
    /**
     * The placeholder's resolved bindings (part overrides, id and status
     * role); apply with `v-bind` so the add button's describedby keeps
     * resolving.
     */
    bindings: VfListResolvedBindings['placeholder']
  }) => VNode[]

  /**
   * Slot that replaces the add button. Receives the button's bindings, add
   * handler, and label.
   *
   * @param scope The add slot's params.
   */
  add: (scope: {
    /**
     * The button label text.
     */
    label: any

    /**
     * The add button's resolved bindings (part overrides, fallback
     * aria-label, placeholder describedby); apply with `v-bind`.
     */
    bindings: VfListResolvedBindings['add']

    /**
     * Handler to add a new list item.
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
   * @param index The item's zero-based index.
   * @tag VfButton
   */
  sort: (index: number) => PartOf<'VfButton'>

  /**
   * The remove action element.
   *
   * @param index The item's zero-based index.
   * @tag VfButton
   */
  remove: (index: number) => PartOf<'VfButton'>

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
 *   plain: import('@vueform/ui').ClassValue
 *   dynamic: (arg1: any, arg2: any) => import('@vueform/ui').ClassValue
 *
 * @see https://ui.vueform.com/guide/classes
 */
export interface VfCloneNameClasses extends ListClasses {
  /**
   * The items container element.
   */
  items: ClassValue

  /**
   * Each list item wrapper. Drag state is exposed via `data-dragging` and
   * `data-drop-target` attributes (and `data-wrapped` for the `wrap` prop) on
   * the item's bindings, so the class value is static.
   */
  item: ClassValue

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
export interface VfCloneNameExpose extends ListExpose {}

/**
 * The element's context — the object slots, outlets, and event handlers
 * receive (`context$`). Its shape is derived from the blueprint and the
 * interfaces above — customize those; don't extend or edit this one.
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
  VfListBindings,
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
const { api, context, expose, outlets, useClasses, useBindings } = useBlueprint(
  blueprint,
  props,
  events,
  slots
)

const { t } = useI18n()

/**
 * The element's own classes, per part — reactive via the callback's api
 * refs. The class keys come from VfCloneNameClasses above.
 *
 * @see https://ui.vueform.com/guide/classes
 */
const classes = useClasses({
  root: 'vf-list',
  items: 'vf-list-items',
  item: 'vf-list-item',
  element: 'vf-list-element',
  sort: 'vf-list-sort',
  remove: 'vf-list-remove',
  placeholder: 'vf-list-placeholder',
  add: 'vf-list-add',
})

const bindings = useBindings({
  items: () => ({
    role: 'list' as const,
  }),
  item: (beingDragged: boolean, isDropTarget: boolean) => ({
    role: 'listitem' as const,
    'data-wrapped': api.props.wrap ? '' : undefined,
    'data-dragging': beingDragged ? '' : undefined,
    'data-drop-target': isDropTarget ? '' : undefined,
  }),
  placeholder: () => ({
    id: api.placeholderId.value,
    role: 'status',
  }),
  add: () => ({
    'aria-label': api.addLabel.value ? undefined : t('sr_list_add'),
    'aria-describedby':
      api.items.value.length === 0 && api.placeholder.value
        ? api.placeholderId.value
        : undefined,
  }),
  sort: (index: number) => ({
    'aria-label': t('sr_list_sort', { index: index + 1 }),
  }),
  remove: (index: number) => ({
    'aria-label': api.removeLabel.value
      ? undefined
      : t('sr_list_remove', { index: index + 1 }),
  }),
})

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

<script lang="ts">
import type {
  ArrayModel,
  DefineRegistryEntry,
  EntryPropOf,
  EntrySchemaOf,
  FlattenedListModel,
  IsAny,
  ResolvedBindings,
  SchemaToModel,
} from '@vueform/ui'

type VfListResolvedBindings = ResolvedBindings<VfCloneNameParts, VfListBindings>

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
        :bindings="bindings.placeholder()"
      >
        <component
          v-if="outlets?.placeholder"
          :is="outlets.placeholder"
          :bindings="bindings.placeholder()"
        />
        <div
          v-else-if="placeholder"
          :class="classes.placeholder"
          v-bind="bindings.placeholder()"
        >
          {{ placeholder }}
        </div>
      </slot>

      <div
        v-else
        ref="list"
        :class="classes.items"
        v-bind="bindings.items()"
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
              :class="classes.item"
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
                  :class="classes.sort"
                  v-bind="bindings.sort(index)"
                  @dragstart="handleDragStart($event, index)"
                  @dragend="handleDragEnd"
                />
              </slot>

              <div :class="classes.element" v-bind="bindings.element()">
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
                  :class="classes.remove"
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
        :bindings="bindings.add()"
        :handle-add
      >
        <component
          v-if="outlets?.add"
          :is="outlets.add"
          :label="addLabel!"
          :bindings="bindings.add()"
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
          :class="classes.add"
          v-bind="bindings.add()"
          @click.prevent="handleAdd"
        />
      </slot>
    </VfLayout>
  </slot>
</template>
