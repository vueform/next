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
```
