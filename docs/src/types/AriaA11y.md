```ts
/**
 * Part-keyed accessibility bindings provided by `makeAria` for single-input
 * elements: the `input` bag's ARIA state plus the layout parts' ids and roles.
 */
interface AriaA11y extends A11yLayoutBags {
  /**
   * ARIA state for the input control: describedby to the rendered
   * help/description/error regions, plus invalid, required, and busy state.
   */
  input: {
    'aria-describedby'?: string
    'aria-invalid'?: true
    'aria-required'?: true
    'aria-busy'?: true
  }
}
```
