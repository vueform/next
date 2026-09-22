```ts
/**
 * Resolves the model type for a single list item element.
 */
type ListItemModel<El> = El extends {
  flat: true
  schema: infer S
}
  ? FlattenedListModel<S>
  : El extends { schema: infer S }
    ? SchemaToModel<S>
    : any
```
