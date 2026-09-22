```ts
/**
 * Configuration for the icons factory providing before/after icon props.
 */
type MakeIconsOptions = {
  /**
   * The element's prop values used for icon resolution.
   */
  props: {
    /**
     * Icon to display before the input.
     */
    iconBefore: TProp | undefined

    /**
     * Icon to display after the input.
     */
    iconAfter: TProp | undefined
  }
}
```
