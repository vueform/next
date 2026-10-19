```ts
/**
 * CSS classes for the VfList component's structural parts.
 */
interface VfListClasses extends ListClasses {
  /**
   * The items container element.
   */
  items: ClassValue

  /**
   * Each list item wrapper. Drag state is exposed via `data-dragging` and
   * `data-drop-target` attributes (and `data-wrapped` for the `wrap` prop).
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
   *
   * @param index The item's zero-based index.
   */
  sort: (index: number) => ClassValue

  /**
   * The remove button element.
   *
   * @param index The item's zero-based index.
   */
  remove: (index: number) => ClassValue

  /**
   * The placeholder element displayed when the list is empty.
   */
  placeholder: ClassValue

  /**
   * The add button element.
   */
  add: ClassValue
}
```
