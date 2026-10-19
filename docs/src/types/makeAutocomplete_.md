```ts
/**
 * Resolves the input's `autocomplete` attribute: the explicit `autocomplete`
 * prop when given, otherwise the element's name when it is a valid HTML
 * autofill token (so fields named `email`, `tel`, `postal-code`, … get autofill
 * and WCAG 1.3.5 support out of the box).
 *
 * @param options Factory options containing autocomplete props and
 *   dependencies.
 */
const makeAutocomplete: (
  config?: unknown
) => (options: MakeAutocompleteOptions) => {
  autocomplete: ComputedRef<string | undefined>
}
```
