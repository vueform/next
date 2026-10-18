```ts
/**
 * Accessibility bindings of the form component.
 */
interface FormA11y extends BaseComponentA11y {
  /**
   * The form-level error live region: an assertive, atomic alert that can
   * receive programmatic focus.
   */
  errors: {
    id: string
    role: 'alert'
    'aria-live': 'assertive'
    'aria-atomic': 'true'
    tabindex: -1
  }

  /**
   * The form-level message live region: a polite, atomic status that can
   * receive programmatic focus.
   */
  messages: {
    id: string
    role: 'status'
    'aria-live': 'polite'
    'aria-atomic': 'true'
    tabindex: -1
  }
}
```
