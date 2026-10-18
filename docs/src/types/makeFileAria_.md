```ts
/**
 * Extends the input's part-keyed accessibility bindings (from `makeAria`,
 * which must run earlier in the chain) with the per-file remove control's
 * bag — a function of the file index, resolved at the call site like
 * functional parts.
 *
 * @param options Factory options containing dependencies from earlier
 *   factories.
 */
const makeFileAria: (
  config?: unknown
) => (options: MakeFileAriaOptions) => {
  a11yBindings: ComputedRef<FileAriaA11y>
}
```
