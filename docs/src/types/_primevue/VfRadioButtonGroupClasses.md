```ts
/**
 * CSS classes for the VfRadioButtonGroup component's structural parts.
 */
interface VfRadioButtonGroupClasses extends RadioButtonGroupClasses {
  /**
   * The wrapper element containing all radio button items.
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
   * Each item's `VfRadioButton` child component.
   *
   * @param item The radio button item data.
   */
  item: (item: Record<string, any>) => ClassValue
}
```
