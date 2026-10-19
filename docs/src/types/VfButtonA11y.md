```ts
/**
 * Accessibility bindings of the VfButton component, registered via `useA11y`
 * in the SFC (VfButton is the only consumer, so the bags are defined there
 * rather than as a shared pattern): the `button` bag carries native/ARIA
 * disabled state (native on `<button>`, `aria-disabled` on anchors), busy
 * state, the icon-only accessible name, and describedby.
 */
interface VfButtonA11y extends ButtonA11y, A11yLayoutBags {
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
