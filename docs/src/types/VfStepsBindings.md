```ts
/**
 * Part-keyed binding definitions of the VfSteps component, registered via
 * `useBindings`. The `wrapper` entry is a parameterized resolver, so the key
 * is functional — the template calls `bindings.wrapper(page)`.
 */
interface VfStepsBindings extends StepsBindings {
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
