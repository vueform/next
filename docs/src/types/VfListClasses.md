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
   * Each list item wrapper. Drag state is exposed via `data-dragging` and
   * `data-drop-target` attributes (and `data-wrapped` for the `wrap` prop).
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
```
