```ts
/**
 * Slots available in the VfList component.
 */
interface VfListSlots extends ListSlots<VfListContext> {
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
```
