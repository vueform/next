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
   * Each step wrapper. State is exposed via `data-selected`, `data-enabled`,
   * `data-completed`, `data-invalid`, and `data-loading` attributes.
   */
  wrapper: ClassValue

  /**
   * The step content element.
   */
  step: ClassValue
}
```
