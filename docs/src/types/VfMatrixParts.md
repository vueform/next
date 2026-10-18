```ts
/**
 * Structural parts of the VfMatrix component.
 */
interface VfMatrixParts extends MatrixParts {
  /**
   * The grid layout element.
   *
   * @tag div
   */
  grid: DomAttrsOf<'div'>

  /**
   * The header row element with `display: contents`.
   *
   * @tag div
   */
  header: DomAttrsOf<'div'>

  /**
   * Each column header element.
   *
   * @tag div
   */
  colHeader: DomAttrsOf<'div'>

  /**
   * The screen-reader-only header element.
   *
   * @tag div
   */
  srOnlyHeader: DomAttrsOf<'div'>

  /**
   * Each row element with `display: contents`.
   *
   * @tag div
   */
  row: DomAttrsOf<'div'>

  /**
   * Each row header element.
   *
   * @tag div
   */
  rowHeader: DomAttrsOf<'div'>

  /**
   * Each cell element.
   *
   * @tag div
   */
  cell: DomAttrsOf<'div'>

  /**
   * The drag sort handle wrapper element.
   *
   * @tag div
   */
  sortWrapper: DomAttrsOf<'div'>

  /**
   * The row remove button wrapper element.
   *
   * @tag div
   */
  removeWrapper: DomAttrsOf<'div'>

  /**
   * The drag sort handle element.
   *
   * @param index The row's zero-based index.
   * @tag VfButton
   */
  sort: (index: number) => PartOf<'VfButton'>

  /**
   * The remove action element.
   *
   * @param index The row's zero-based index.
   * @tag VfButton
   */
  remove: (index: number) => PartOf<'VfButton'>

  /**
   * The add action element.
   *
   * @tag VfButton
   */
  add: PartOf<'VfButton'>
}
```
