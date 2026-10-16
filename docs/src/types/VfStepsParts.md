```ts
/**
 * Structural parts of the VfSteps component.
 */
interface VfStepsParts extends StepsParts {
  /**
   * The root steps container element.
   *
   * @tag div
   */
  root: DomAttrsOf<'div'>

  /**
   * The ordered list element containing all steps.
   *
   * @tag ol
   */
  list: DomAttrsOf<'ol'>

  /**
   * Each step wrapper. Receives step state options.
   *
   * @param options Step state used for this wrapper.
   * @tag li
   */
  wrapper: (options: {
    selected: boolean
    enabled: boolean
    completed: boolean
    invalid: boolean
    loading: boolean
  }) => DomAttrsOf<'li'>

  /**
   * The step content element.
   *
   * @tag li
   */
  step: DomAttrsOf<'li'>
}
```
