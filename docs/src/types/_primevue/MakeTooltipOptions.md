```ts
/**
 * Configuration for the tooltip factory resolving tooltip content and
 * directives for input elements.
 */
type MakeTooltipOptions = {
  /**
   * The element's prop values used for tooltip resolution.
   */
  props: {
    /**
     * The tooltip text content for the input element.
     */
    tooltip: TProp | undefined

    /**
     * The position of the tooltip relative to the element.
     */
    tooltipPos: TooltipPosProp | undefined
  }
}
```
