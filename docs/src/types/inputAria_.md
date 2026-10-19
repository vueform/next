```ts
/**
 * A11y pattern for single-input elements: the `input` bag carries ARIA state
 * (describedby, invalid, required, busy), and the layout bags (label, help,
 * description, errors) carry the ids and roles their regions must render
 * with.
 *
 * Register with `useA11y(inputAria())`.
 */
const inputAria: () => (
  api: LayoutPatternApi & {
    hasError: Ref<boolean>
    busy: Ref<boolean>
    required: Ref<boolean>
  }
) => InputAriaA11y
```
