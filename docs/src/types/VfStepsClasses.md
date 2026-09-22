```ts
/**
 * CSS classes for the VfSteps component's structural parts.
 */
interface VfStepsClasses extends StepsClasses {
  /**
   * The root steps container element.
   */
  root: ClassValue

  /**
   * The ordered list element containing all steps.
   */
  list: ClassValue

  /**
   * Each step wrapper. Receives step state options.
   *
   * @param options Step state used for this wrapper.
   */
  wrapper: (options: {
    selected: boolean
    enabled: boolean
    completed: boolean
    invalid: boolean
    loading: boolean
  }) => ClassValue

  /**
   * The step content element.
   */
  step: ClassValue
}
```
