```ts
/**
 * Structural parts of the VfCheckboxGroup component.
 */
interface VfCheckboxGroupParts extends CheckboxGroupParts {
  /**
   * The wrapper element containing all checkbox items.
   *
   * @tag div
   */
  group: DomAttrsOf<'div'>

  /**
   * The fieldset element wrapping each group when items are grouped.
   *
   * @param group The group data.
   * @tag fieldset
   */
  fieldset: (group: Record<string, any>) => DomAttrsOf<'fieldset'>

  /**
   * The legend element displaying the group label.
   *
   * @param group The group data.
   * @tag legend
   */
  legend: (group: Record<string, any>) => DomAttrsOf<'legend'>

  /**
   * Props factory for each VfCheckbox child component, receiving the item data.
   *
   * @param item The checkbox item data.
   * @tag VfCheckbox
   */
  item: (item: Record<string, any>) => PartOf<'VfCheckbox'>
}
```
