```ts
/**
 * Styling modifiers of the VfSteps component.
 */
interface VfStepsModifiers extends StepsModifiers {
  /**
   * Each step wrapper's selection, navigation, completion, validity, and
   * loading state.
   *
   * @param page The resolved page object for this step.
   */
  wrapper: (page: ResolvedPage) => {
    'data-selected'?: ''
    'data-enabled'?: ''
    'data-completed'?: ''
    'data-invalid'?: ''
    'data-loading'?: ''
  }
}
```
