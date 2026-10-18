```ts
/**
 * Styling modifiers of the VfList component.
 */
interface VfListModifiers extends ListModifiers {
  /**
   * The root element's label-alignment marker, set while the element renders
   * without help text.
   */
  root: {
    'data-align-label'?: ''
  }

  /**
   * Each list item wrapper's wrap marker and drag state.
   *
   * @param beingDragged Whether this item is currently being dragged.
   * @param isDropTarget Whether this item is the current drop target.
   */
  item: (
    beingDragged: boolean,
    isDropTarget: boolean
  ) => {
    'data-wrapped'?: ''
    'data-dragging'?: ''
    'data-drop-target'?: ''
  }
}
```
