```ts
/**
 * Part-keyed binding definitions of the VfForm component, registered via
 * `useBindings`. Zero-argument resolver entries — resolved at each part's
 * consuming site, keys stay static.
 */
interface VfFormBindings extends FormBindings {
  /**
   * The root form element's stacked layout marker.
   */
  root: {
    'data-stacked'?: ''
  }

  /**
   * The form-level error live region (the errors wrapper): an assertive,
   * atomic alert that can receive programmatic focus. Keyed to the `errors`
   * container part — a list element cannot carry the alert role.
   */
  errors: {
    id: string
    role: 'alert'
    'aria-live': 'assertive'
    'aria-atomic': 'true'
    tabindex: -1
  }

  /**
   * The form-level message live region (the messages wrapper): a polite,
   * atomic status that can receive programmatic focus. Keyed to the `messages`
   * container part — a list element cannot carry the status role.
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
