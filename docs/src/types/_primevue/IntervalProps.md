```ts
/**
 * Interval-related props mixed into element components that support min, max,
 * and step boundaries (e.g. slider, knob, input-number).
 */
interface IntervalProps {
  /**
   * Minimum boundary value. Accepts expressions.
   */
  min?: DProp<number>

  /**
   * Maximum boundary value. Accepts expressions.
   */
  max?: DProp<number>

  /**
   * Step factor to increment/decrement the value. Accepts expressions.
   */
  step?: DProp<number>
}
```
