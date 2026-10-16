```ts
/**
 * Resolves the model (value) type for a specific dot-separated path within a
 * form schema.
 */
type ModelByPath<T, P extends string> = [FormSchema] extends [T]
  ? any
  : [T] extends [ArraySchemaType]
    ? ModelByPath<ToObjectSchema<T>, P>
    : P extends `${infer F}.${infer R}`
      ? F extends keyof T
        ? T[F] extends infer El
          ? El extends {
              type: GroupTypes
              schema: infer S
            }
            ? ModelByPath<S, R>
            : El extends {
                  type: GridTypes
                  grid: infer G extends GridSchemaLike
                }
              ? ModelByPath<GridToSchema<G>, R>
              : El extends {
                    type: ListTypes
                    flat: true
                    schema: infer S
                  }
                ? ModelByPath<
                    {
                      [I in `${bigint}`]: SingleSchemaElement<ToObjectSchema<S>>
                    },
                    R
                  >
                : El extends { type: ListTypes }
                  ? R extends `${bigint}`
                    ? ListItemModel<El>
                    : R extends `${bigint}.${infer SR}`
                      ? El extends { schema: infer S }
                        ? ModelByPath<S, SR>
                        : any
                      : any
                  : any
          : any
        : any
      : P extends keyof T
        ? ElementModelForPath<T[P]>
        : any
```
