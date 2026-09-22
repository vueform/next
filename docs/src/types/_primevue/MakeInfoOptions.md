```ts
/**
 * Configuration for the info factory resolving informational tooltip or helper
 * text for input elements.
 */
type MakeInfoOptions = {
  /**
   * The element's prop values used for info text resolution.
   */
  props: {
    /**
     * Informational text displayed as a helper or tooltip for the input.
     */
    info: TProp | undefined

    /**
     * Position of the info tooltip relative to the info icon.
     */
    infoPosition: InfoPositionProp | undefined
  }
}
```
