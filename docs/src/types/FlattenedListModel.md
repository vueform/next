```ts
/**
 * Flattens a list element's child schema into its model type.
 */
type FlattenedListModel<S> =
  SingleSchemaElement<ToObjectSchema<S>> extends infer E
    ? [E] extends [never]
      ? any
      : ElementToModel<E>
    : any
```
