```ts
/**
 * Factory API produced by the checkboxes blueprint's `blueprint` function,
 * optionally parameterized by concrete props (e.g.
 * `CheckboxesApi<VfCheckboxesProps<typeof items, 'id'>>`). Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites (Expose / Context
 * layers, extensions).
 */
type CheckboxesApi<TProps extends LooseCheckboxesProps = LooseCheckboxesProps> =
  ItemsModelApi<ReturnType<typeof blueprint>, TProps>
```
