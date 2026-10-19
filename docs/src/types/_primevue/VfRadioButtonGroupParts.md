```ts
/**
 * Structural parts of the VfRadioButtonGroup component.
 */
interface VfRadioButtonGroupParts extends RadioButtonGroupParts {
  /**
   * The wrapper element containing all radio button items.
   *
   * @tag div
   */
  wrapper: DomAttrsOf<'div'>

  /**
   * The fieldset element wrapping each group when items are grouped.
   *
   * @param group The group data.
   * @tag fieldset
   */
  group: (group: Record<string, any>) => DomAttrsOf<'fieldset'>

  /**
   * The legend element displaying the group label.
   *
   * @param group The group data.
   * @tag legend
   */
  groupLabel: (group: Record<string, any>) => DomAttrsOf<'legend'>

  /**
   * Props factory for each VfRadioButton child component, receiving the item
   * data.
   *
   * @param item The radio button item data.
   * @tag VfRadioButton
   */
  item: (item: Record<string, any>) => PartOf<'VfRadioButton'>
}
```
