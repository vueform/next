```ts
/**
 * Structural parts of the VfList component.
 */
interface VfListParts extends ListParts {
  /**
   * The items container element.
   *
   * @tag div
   */
  items: DomAttrsOf<'div'>

  /**
   * Each list item wrapper. Receives drag state.
   *
   * @param beingDragged Whether this item is currently being dragged.
   * @param isDropTarget Whether this item is the current drop target.
   * @tag div
   */
  item: (beingDragged: boolean, isDropTarget: boolean) => DomAttrsOf<'div'>

  /**
   * The element wrapper within each list item.
   *
   * @tag div
   */
  element: DomAttrsOf<'div'>

  /**
   * The drag handle element.
   *
   * @tag VfButton
   */
  sort: PartOf<'VfButton'>

  /**
   * The remove action element.
   *
   * @tag VfButton
   */
  remove: PartOf<'VfButton'>

  /**
   * The placeholder element displayed when the list is empty.
   *
   * @tag div
   */
  placeholder: DomAttrsOf<'div'>

  /**
   * The add action element.
   *
   * @tag VfButton
   */
  add: PartOf<'VfButton'>
}
```
