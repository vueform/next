```ts
/**
 * Styling modifiers of the VfGrid component.
 */
interface VfGridModifiers extends GridModifiers {
  /**
   * The root element's label-alignment marker, set while the element renders
   * without help text.
   */
  root: {
    'data-align-label'?: ''
  }

  /**
   * The grid wrapper's scroll-mode marker, set while `scrollable` is enabled.
   */
  wrapper: {
    'data-scrollable'?: ''
  }

  /**
   * The grid element's fit marker, set while the grid fits its columns to a
   * fixed width.
   */
  grid: {
    'data-fit'?: ''
  }

  /**
   * Each cell element's horizontal and vertical alignment attributes.
   *
   * @param options Alignment, optional schema, and header flags for this cell.
   */
  cell: (options: {
    align: AlignProp
    valign: ValignProp
    schema?: any
    colHeader?: boolean
    rowHeader?: boolean
  }) => {
    'data-align'?: AlignProp
    'data-valign'?: ValignProp
  }
}
```
