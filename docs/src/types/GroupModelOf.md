```ts
/**
 * Groups carry a model shaped by their child schema regardless of `nested`:
 * nested groups store it under their own key, non-nested groups bind the same
 * shape as a scoped projection of the parent's level (`SchemaToModel` flattens
 * non-nested descendants the same way the runtime projection does). Wide /
 * `any` entries stay permissive (`ObjectModel`).
 */
type GroupModelOf<TEntry> =
  IsAny<EntryPropOf<TEntry, 'nested'>> extends true
    ? ObjectModel
    : SchemaToModel<EntrySchemaOf<TEntry>>
```
