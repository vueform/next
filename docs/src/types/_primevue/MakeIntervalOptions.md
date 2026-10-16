```ts
/**
 * Configuration for the interval factory resolving min, max, and step
 * boundaries.
 */
type MakeIntervalOptions = {
  /**
   * The element's prop values used for interval resolution.
   */
  props: {
    /**
     * Minimum boundary value. Accepts expressions.
     */
    min: DProp<number> | undefined

    /**
     * Maximum boundary value. Accepts expressions.
     */
    max: DProp<number> | undefined

    /**
     * Step factor to increment/decrement the value. Accepts expressions.
     */
    step: DProp<number> | undefined
  }
  /**
   * Resolved dependencies from earlier factories.
   */
  deps: ReturnsOf<[[typeof makeData, ['update', 'value']]]>
}
```
