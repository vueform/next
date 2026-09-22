```ts
/**
 * ARIA attribute overrides for accessibility on form elements.
 */
type AriaProp = {
  /**
   * The ID of the element that labels this component.
   */
  'aria-labelledby'?: string

  /**
   * The ID of the element that describes this component.
   */
  'aria-describedby'?: string

  /**
   * Whether the field is required for form submission.
   */
  'aria-required'?: boolean

  /**
   * Whether the field is currently in an invalid state.
   */
  'aria-invalid'?: boolean

  /**
   * Whether the field is currently processing or loading.
   */
  'aria-busy'?: boolean

  [key: string]: any
}
```
