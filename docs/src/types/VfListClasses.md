```ts
/**
 * CSS classes for the VfList component's structural parts.
 */
interface VfListClasses extends ListClasses {
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
```
