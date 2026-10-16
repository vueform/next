```ts
/**
 * Extracts the model type from a full element schema entry, handling container
 * nesting (`group` / `grid` / `list`) before registry-driven leaf resolution.
 */
type ElementToModel<El> = El extends {
  type: GroupTypes
  nested: true
  schema: infer S
}
  ? SchemaToModel<S>
  : El extends {
        type: GridTypes
        nested: true
        grid: infer G extends GridSchemaLike
      }
    ? ObjectSchemaToModel<GridToSchema<G>>
    : El extends {
          type: ListTypes
          flat: true
          schema: infer S
        }
      ? FlattenedListModel<S>[]
      : El extends { type: ListTypes; schema: infer S }
        ? SchemaToModel<S>[]
        : El extends { type: ListTypes }
          ? any[]
          : El extends { type: infer TY extends string }
            ? ElementNameOfType<TY> extends infer N
              ? [N] extends [never]
                ? any
                : N extends ElementNames
                  ? ModelOfElement<N, El>
                  : any
              : any
            : any
```
