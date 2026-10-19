```ts
/**
 * CSS classes for the VfCheckboxGroup component's structural parts.
 */
interface VfCheckboxGroupClasses extends CheckboxGroupClasses {
  /**
   * The wrapper element containing all checkbox items.
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
   * Each item's `VfCheckbox` child component.
   *
   * @param item The checkbox item data.
   */
  item: (item: Record<string, any>) => ClassValue
}
```
