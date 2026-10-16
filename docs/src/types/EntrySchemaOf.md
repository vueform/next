```ts
/**
 * Resolves the child `schema` from a registry `TEntry` payload (unwrapping a
 * possible `Ref`), falling back to the wide `FormSchema` when absent.
 */
type EntrySchemaOf<TEntry> =
  EntryPropOf<TEntry, 'schema'> extends infer S
    ? [S] extends [undefined]
      ? FormSchema
      : S extends Ref<infer V>
        ? V
        : S
    : FormSchema
```
