```ts
/**
 * Grids carry a model shaped by their named cell elements regardless of
 * `nested`: nested grids store it under their own key, non-nested grids bind
 * the same shape as a scoped projection of the parent's level. Wide / `any`
 * entries and grids without a `grid` schema stay permissive (`ObjectModel`).
 */
type GridModelOf<TEntry> =
  IsAny<EntryPropOf<TEntry, 'nested'>> extends true
    ? ObjectModel
    : EntryGridOf<TEntry> extends infer G
      ? [G] extends [undefined]
        ? ObjectModel
        : SchemaToModel<GridToSchema<G>>
      : ObjectModel
```
