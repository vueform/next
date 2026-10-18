```ts
/**
 * Provides the part-keyed accessibility bindings for the button element: the
 * `button` bag carries disabled (native on `<button>`, `aria-disabled` on
 * anchors, which ignore the native attribute but must stay discoverable),
 * busy state, an icon-only accessible name, and describedby to the rendered
 * help/description/error regions.
 *
 * @param options Factory options containing element props and dependencies.
 */
const makeButtonAria: (
  config?: unknown
) => (options: MakeButtonAriaOptions) => {
  a11yBindings: ComputedRef<ButtonAriaA11y>
}
```
