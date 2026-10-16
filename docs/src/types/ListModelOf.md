```ts
/**
 * Lists carry a rows-array model shaped by their child schema and `flat` prop:
 * `flat: true` lists (single-element schema) flatten each row to that element's
 * model, regular lists carry one object per row. Wide / `any` entries stay
 * permissive (`ArrayModel`).
 */
type ListModelOf<TEntry> =
  IsAny<EntryPropOf<TEntry, 'flat'>> extends true
    ? ArrayModel
    : EntryPropOf<TEntry, 'flat'> extends true
      ? FlattenedListModel<EntrySchemaOf<TEntry>>[]
      : SchemaToModel<EntrySchemaOf<TEntry>>[]
```
