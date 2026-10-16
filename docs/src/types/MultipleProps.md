```ts
/**
 * Props for elements that support multi-selection.
 *
 * Includes a naked `boolean` arm alongside `TMultiple` so the erased
 * `ElementSchema` / `FormSchema` surface (where `TMultiple` defaults to
 * `false`) still accepts `multiple: true`. Literals continue to infer into
 * `TMultiple` for model typing.
 */
interface MultipleProps<TMultiple extends boolean = boolean> {
  /**
   * Whether to allow multiple selections.
   */
  multiple?: TMultiple | boolean
}
```
