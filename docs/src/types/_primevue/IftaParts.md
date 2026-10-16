```ts
/**
 * Structural parts for the IFTA label wrapper.
 */
interface IftaParts {
  /**
   * The PrimeVue IftaLabel wrapper around the input.
   *
   * @tag IftaLabel
   */
  iftaWrapper: AIftaLabelProps & Record<string, any>

  /**
   * The label tag inside PrimeVue IftaLabel.
   *
   * @tag label
   */
  ifta: DOMAttrs['label']
}
```
