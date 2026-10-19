```ts
interface BaseElementClasses extends BaseComponentClasses {
  /**
   * The element's root wrapper. Elements contribute their identity class here
   * (e.g. `vf-text`); the adapters' identically-shaped augmentations layer the
   * spacing/divider props the layout-rendered root classes depend on.
   */
  root: (props: {
    /**
     * Vertical spacing (padding) above the element, as a spacing token (1-3).
     */
    spaceTop?: number

    /**
     * Vertical spacing (padding) below the element, as a spacing token (1-3).
     */
    spaceBottom?: number

    /**
     * Whether a horizontal line (border) renders above the element.
     */
    lineTop?: boolean

    /**
     * Whether a horizontal line (border) renders below the element.
     */
    lineBottom?: boolean
  }) => ClassValue
}
```
