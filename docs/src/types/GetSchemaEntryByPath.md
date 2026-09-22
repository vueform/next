```ts
/**
 * Resolves the schema entry object at a dot-separated path (the element
 * config). Non-flat list rows resolve to the synthetic group prototype the list
 * wraps its rows in at runtime. Unresolvable paths yield `never`.
 */
type GetSchemaEntryByPath<T, P extends string> = [FormSchema] extends [T]
  ? never
  : [T] extends [ArraySchemaType]
    ? GetSchemaEntryByPath<ToObjectSchema<T>, P>
    : P extends `${infer F}.${infer R}`
      ? F extends keyof T
        ? T[F] extends infer El
          ? El extends {
              type: GroupTypes
              schema: infer S
            }
            ? GetSchemaEntryByPath<S, R>
            : El extends {
                  type: GridTypes
                  grid?: infer G extends GridSchemaLike
                }
              ? GetSchemaEntryByPath<GridToSchema<G>, R>
              : El extends {
                    type: ListTypes
                    flat: true
                    schema: infer S
                  }
                ? GetSchemaEntryByPath<
                    {
                      [I in `${bigint}`]: SingleSchemaElement<ToObjectSchema<S>>
                    },
                    R
                  >
                : El extends { type: ListTypes; schema: infer S }
                  ? R extends `${bigint}.${infer SR}`
                    ? GetSchemaEntryByPath<S, SR>
                    : R extends `${bigint}`
                      ? ListRowEntry<S>
                      : never
                  : never
          : never
        : never
      : P extends keyof T
        ? T[P]
        : never
```
