```ts
/**
 * Provides the part-keyed accessibility bindings for a single-input element:
 * the `input` bag carries ARIA state (describedby, invalid, required, busy),
 * and the layout bags (label, help, description, error) carry the ids and
 * roles their regions must render with.
 *
 * @param options Factory options containing element props and dependencies.
 */
const makeAria: (
  config?: unknown
) => (options: MakeAriaOptions) => { a11yBindings: ComputedRef<AriaA11y> }
```
