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
```
