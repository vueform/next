```ts
/**
 * Structural parts of the VfRadios component.
 */
interface VfRadiosParts extends RadiosParts {
  /**
   * The wrapper element containing all radio items.
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
   * Props factory for each VfRadio child component, receiving the item data.
   *
   * @param item The radio item data.
   * @tag VfRadio
   */
  item: (item: Record<string, any>) => PartOf<'VfRadio'>
}
```
