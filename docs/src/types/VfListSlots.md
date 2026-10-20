```ts
/**
 * Slots available in the VfList component.
 */
interface VfListSlots extends ListSlots<VfListContext> {
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
```
