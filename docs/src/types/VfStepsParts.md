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
   * Each step wrapper. Receives the step's resolved page.
   *
   * @param page The resolved page data for this step.
   * @tag li
   */
  wrapper: (page: ResolvedPage) => DomAttrsOf<'li'>

  /**
   * The step content element.
   *
   * @tag li
   */
  step: DomAttrsOf<'li'>
}
```
