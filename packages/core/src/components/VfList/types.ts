import type { Component, VNode } from 'vue'

import type {
  ListApi,
  ListClasses,
  ListEmits,
  ListExpose,
  ListParts,
  ListProps,
  ListSlots,
} from '#src/blueprints/list'
import type { ArrayModel } from '#src/features'
import type {
  DefineElementContext,
  ClassValue,
  DomAttrsOf,
  ElementName,
  EntryPropOf,
  FlattenedListModel,
  IsAny,
  PartOf,
  DefineRegistryEntry,
  SchemaToModel,
  WidenProps,
  EntrySchemaOf,
} from '#src/types'

/**
 * Lists carry a rows-array model shaped by their child schema and `flat` prop:
 * `flat: true` lists (single-element schema) flatten each row to that element's
 * model, regular lists carry one object per row. Wide / `any` entries stay
 * permissive (`ArrayModel`).
 */
export type ListModelOf<TEntry> =
  IsAny<EntryPropOf<TEntry, 'flat'>> extends true
    ? ArrayModel
    : EntryPropOf<TEntry, 'flat'> extends true
      ? FlattenedListModel<EntrySchemaOf<TEntry>>[]
      : SchemaToModel<EntrySchemaOf<TEntry>>[]

/**
 * VfList props narrowed from a registry `TEntry` payload — `modelValue` is
 * driven by `schema` + `flat` the same way select models are driven by `items`.
 * Feeds both `defineSchema` validation and the narrowed `VfListContext` /
 * `ListApi` model slice used by `find()`.
 */
export type EntryProps<TEntry> = Omit<VfListProps, 'modelValue'> & {
  modelValue?: ListModelOf<TEntry>
}
/**
 * Props for the VfList component.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
 */
export interface VfListProps extends ListProps<
  'list',
  VfListSlots,
  VfListParts,
  VfListClasses,
  VfListContext
> {}

/**
 * Events emitted by the VfList component.
 */
export interface VfListEmits extends ListEmits<VfListContext> {}

/**
 * Slots available in the VfList component.
 */
export interface VfListSlots extends ListSlots<VfListContext> {
  /**
   * Slot that replaces each list item wrapper. Receives drag state and event
   * handlers.
   *
   * @param scope The item slot's params.
   */
  item: (scope: {
    /**
     * CSS classes for the item wrapper.
     */
    class: ClassValue

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
     * Handler for the drag enter event.
     */
    handleDragEnter: ($event: DragEvent) => void

    /**
     * Handler for the drag start event.
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
   * Slot that replaces the drag handle. Receives class and drag event handlers.
   *
   * @param scope The sort slot's params.
   */
  sort: (scope: {
    /**
     * CSS classes for the handle element.
     */
    class: ClassValue

    /**
     * Handler for the drag start event.
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
   * Slot that replaces the remove button. Receives class and remove handler.
   *
   * @param scope The remove slot's params.
   */
  remove: (scope: {
    /**
     * CSS classes for the remove button.
     */
    class: ClassValue

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
     * CSS classes for the placeholder element.
     */
    class: ClassValue
  }) => VNode[]

  /**
   * Slot that replaces the add button. Receives class, add handler, and label.
   *
   * @param scope The add slot's params.
   */
  add: (scope: {
    /**
     * CSS classes for the add button.
     */
    class: ClassValue

    /**
     * Handler to add a new list item.
     */
    handleAdd: () => void

    /**
     * The button label text.
     */
    label: any
  }) => VNode[]
}

/**
 * Structural parts of the VfList component.
 */
export interface VfListParts extends ListParts {
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
 * CSS classes for the VfList component's structural parts.
 */
export interface VfListClasses extends ListClasses {
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
 * Augmentable public API surface for VfList.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `ListExpose` for all list-based components) so they
 * appear on `ContextOf<'VfList'>` / `context$` / `defineExpose`.
 */
export interface VfListExpose extends ListExpose {}

/**
 * Public context for VfList, optionally parameterized by concrete props (e.g.
 * schema-narrowed `EntryProps` with a typed `modelValue`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
export interface VfListContext<
  TProps extends WidenProps<VfListProps, ListProps<string>> = VfListProps,
> extends DefineElementContext<
  TProps,
  VfListEmits,
  VfListSlots,
  VfListParts,
  VfListClasses,
  VfListExpose,
  ListApi<TProps>
> {}

/**
 * Registry entry for VfList. `TEntry` narrows `modelValue` from the entry's
 * `schema` + `flat` props so `defineSchema` constrains list models (and
 * `default`s) to their row shape and types `find()`'s returned `model` the same
 * way.
 */
export interface VfListEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfListEmits,
  VfListSlots,
  VfListParts,
  VfListClasses,
  VfListContext<EntryProps<TEntry>>
> {}
