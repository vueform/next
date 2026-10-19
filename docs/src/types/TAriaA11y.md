```ts
/**
 * Part-keyed accessibility bindings produced by the `tInputAria` pattern for
 * translatable text inputs: the `input` bag additionally references the
 * editing-language live region and carries the input's `lang`.
 */
interface TAriaA11y extends InputAriaA11y {
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
