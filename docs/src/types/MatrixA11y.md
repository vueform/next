```ts
/**
 * Accessibility bindings of the matrix element.
 */
interface MatrixA11y extends BaseElementA11y {
  /**
   * The add-row control's localized accessible name (when it renders without
   * a visible label).
   */
  add: {
    'aria-label'?: string
  }

  /**
   * The per-row sort handle's localized accessible name.
   *
   * @param index The row's zero-based index.
   */
  sort: (index: number) => {
    'aria-label': string
  }

  /**
   * The per-row remove control's localized accessible name (when it renders
   * without a visible label).
   *
   * @param index The row's zero-based index.
   */
  remove: (index: number) => {
    'aria-label'?: string
  }
}
```
