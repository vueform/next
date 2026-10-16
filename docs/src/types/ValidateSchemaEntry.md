```ts
/**
 * Validates a single schema entry: resolves the registered component from its
 * `type`, re-narrows the model-coupled and item-key props from the registry
 * entry, then recursively validates nested schemas.
 *
 * When `type` is missing or unknown, falls back to `ElementSchema` so object
 * literals still get element prop autocomplete inside `defineSchema`.
 */
type ValidateSchemaEntry<El> = El extends {
  type: infer TY extends string
}
  ? ElementNameOfType<TY> extends infer N
    ? [N] extends [never]
      ? ElementSchema
      : N extends ElementNames
        ? ValidateNestedSchema<ConstrainEntryModel<El, N>>
        : ElementSchema
    : ElementSchema
  : ElementSchema
```
