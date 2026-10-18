```ts
/**
 * Provides the part-keyed accessibility bindings for translatable text
 * inputs: the `input` bag additionally references the editing-language live
 * region and carries the input's `lang`.
 *
 * @param options Factory options containing element props and dependencies.
 */
const makeTAria: (
  config?: unknown
) => (options: MakeTAriaOptions) => { a11yBindings: ComputedRef<TAriaA11y> }
```
