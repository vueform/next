```ts
/**
 * Accessibility bindings of the list element.
 */
interface ListA11y extends BaseElementA11y {
  /**
   * The items container's list role.
   */
  items: {
    role: 'list'
  }

  /**
   * Each item wrapper's listitem role.
   *
   * @param beingDragged Whether this item is currently being dragged.
   * @param isDropTarget Whether this item is the current drop target.
   */
  item: (
    beingDragged: boolean,
    isDropTarget: boolean
  ) => {
    role: 'listitem'
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
