```ts
/**
 * Structural parts for the float label wrapper.
 */
interface FloatLabelParts {
  /**
   * The PrimeVue FloatLabel wrapper around the input.
   *
   * @tag FloatLabel
   */
  floatWrapper: AFloatLabelProps & Record<string, any>

  /**
   * The label tag inside PrimeVue FloatLabel.
   *
   * @tag label
   */
  float: DOMAttrs['label']
}
```
