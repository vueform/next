```ts
/**
 * Part-keyed accessibility bindings provided by `makeTAria` for translatable
 * text inputs: the `input` bag additionally references the editing-language
 * live region and carries the input's `lang`.
 */
interface TAriaA11y extends AriaA11y {
  /**
   * ARIA state for the input control, including the active editing language.
   */
  input: {
    'aria-describedby'?: string
    'aria-invalid'?: true
    'aria-required'?: true
    'aria-busy'?: true
    lang?: string
  }
}
```
