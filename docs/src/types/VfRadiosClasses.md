```ts
/**
 * CSS classes for the VfRadios component's structural parts.
 */
interface VfRadiosClasses extends RadiosClasses {
  /**
   * The wrapper element containing all radio items.
   */
  wrapper: ClassValue

  /**
   * The fieldset element wrapping each group when items are grouped.
   *
   * @param group The group data.
   */
  group: (group: Record<string, any>) => ClassValue

  /**
   * The legend element displaying the group label.
   *
   * @param group The group data.
   */
  groupLabel: (group: Record<string, any>) => ClassValue

  /**
   * Each item's `VfRadio` child component.
   *
   * @param item The radio item data.
   */
  item: (item: Record<string, any>) => ClassValue
}
```
