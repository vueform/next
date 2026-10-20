import type { Component, VNode } from 'vue'

import type {
  ListApi,
  ListBindings,
  ListClasses,
  ListEmits,
  ListExpose,
  ListParts,
  ListProps,
  ListSlots,
} from '#src/blueprints/list'
import type { ResolvedBindings } from '#src/composables'
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
 * Resolved per-part binding bags for VfList slot scopes.
 */
type VfListResolvedBindings = ResolvedBindings<VfListParts, VfListBindings>

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
 * CSS classes for the VfList component's structural parts.
 */
export interface VfListClasses extends ListClasses {
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
 * Part-keyed binding definitions of the VfList component. The `items` entry
 * is a static bag; `placeholder` and `add` are zero-argument resolvers —
 * resolved at each part's consuming site, keys stay static — and the
 * per-item `item` / `sort` / `remove` entries are parameterized, so those
 * keys are functional.
 */
export interface VfListBindings extends ListBindings {
  /**
   * The root element's label-alignment marker, set while the element renders
   * without help text.
   */
  root: {
    'data-align-label'?: ''
  }

  /**
   * The items container's list role.
   */
  items: {
    role: 'list'
  }

  /**
   * Each item wrapper's listitem role plus its wrap marker and drag state.
   *
   * @param beingDragged Whether this item is currently being dragged.
   * @param isDropTarget Whether this item is the current drop target.
   */
  item: (
    beingDragged: boolean,
    isDropTarget: boolean
  ) => {
    role: 'listitem'
    'data-wrapped'?: ''
    'data-dragging'?: ''
    'data-drop-target'?: ''
  }

  /**
   * The empty-state placeholder's id and status role.
   */
  placeholder: {
    id: string
    role: 'status'
  }

  /**
   * The add control's accessible name (when it renders without a visible
   * label) and its describedby to the empty-state placeholder.
   */
  add: {
    'aria-label'?: string
    'aria-describedby'?: string
  }

  /**
   * The per-item sort handle's localized accessible name.
   *
   * @param index The item's zero-based index.
   */
  sort: (index: number) => {
    'aria-label': string
  }

  /**
   * The per-item remove control's localized accessible name (when it renders
   * without a visible label).
   *
   * @param index The item's zero-based index.
   */
  remove: (index: number) => {
    'aria-label'?: string
  }
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
  VfListBindings,
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
