```ts
/**
 * Part-keyed accessibility bindings provided by `makeButtonAria`: the `button`
 * bag carries native/ARIA disabled state (native on `<button>`,
 * `aria-disabled` on anchors), busy state, the icon-only accessible name, and
 * describedby.
 */
interface ButtonAriaA11y extends A11yLayoutBags {
  /**
   * Native/ARIA state for the button control.
   */
  button: {
    disabled?: true
    'aria-disabled'?: true
    'aria-busy'?: true
    'aria-label'?: string
    'aria-describedby'?: string
  }
}
```
