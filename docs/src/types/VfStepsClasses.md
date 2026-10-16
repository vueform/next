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
    /**
     * Whether the step is currently selected.
     */
    selected: boolean

    /**
     * Whether the step is enabled for navigation.
     */
    enabled: boolean

    /**
     * Whether the step's page has been completed.
     */
    completed: boolean

    /**
     * Whether the step's page has validation errors.
     */
    invalid: boolean

    /**
     * Whether the step's page is busy validating or processing an event.
     */
    loading: boolean
  }) => ClassValue

  /**
   * The step content element.
   */
  step: ClassValue
}
```
