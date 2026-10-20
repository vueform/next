```ts
/**
 * Part-keyed binding definitions of the VfList component. The `items` entry
 * is a static bag; `placeholder` and `add` are zero-argument resolvers —
 * resolved at each part's consuming site, keys stay static — and the
 * per-item `item` / `sort` / `remove` entries are parameterized, so those
 * keys are functional.
 */
interface VfListBindings extends ListBindings {
  /**
   * The root element's label-alignment marker, set while the element renders
   * without help text.
   */
  root: {
    'data-align-label'?: ''
  }

  /**
   * The items container's list role.
   */
  items: {
    role: 'list'
  }

  /**
   * Each item wrapper's listitem role plus its wrap marker and drag state.
   *
   * @param beingDragged Whether this item is currently being dragged.
   * @param isDropTarget Whether this item is the current drop target.
   */
  item: (
    beingDragged: boolean,
    isDropTarget: boolean
  ) => {
    role: 'listitem'
    'data-wrapped'?: ''
    'data-dragging'?: ''
    'data-drop-target'?: ''
  }

  /**
   * The empty-state placeholder's id and status role.
   */
  placeholder: {
    id: string
    role: 'status'
  }

  /**
   * The add control's accessible name (when it renders without a visible
   * label) and its describedby to the empty-state placeholder.
   */
  add: {
    'aria-label'?: string
    'aria-describedby'?: string
  }

  /**
   * The per-item sort handle's localized accessible name.
   *
   * @param index The item's zero-based index.
   */
  sort: (index: number) => {
    'aria-label': string
  }

  /**
   * The per-item remove control's localized accessible name (when it renders
   * without a visible label).
   *
   * @param index The item's zero-based index.
   */
  remove: (index: number) => {
    'aria-label'?: string
  }
}
```
