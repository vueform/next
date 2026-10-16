```ts
/**
 * Resolves the model type used for path-based value access (containers resolve
 * to their nested model regardless of `nested`, matching runtime `get`).
 */
type ElementModelForPath<El> = El extends {
  type: GroupTypes
  schema: infer S
}
  ? SchemaToModel<S>
  : El extends { type: GridTypes; grid: infer G extends GridSchemaLike }
    ? ObjectSchemaToModel<GridToSchema<G>>
    : ElementToModel<El>
```
