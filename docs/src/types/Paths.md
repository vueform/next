```ts
/**
 * Computes a union of all valid dot-separated paths within a form schema. Wide
 * / index-signature schemas yield `never` (path suggestions require a concrete
 * schema).
 */
type Paths<T> = [FormSchema] extends [T]
  ? never
  : [T] extends [ArraySchemaType]
    ? Paths<ToObjectSchema<T>>
    : string extends keyof T
      ? never
      : {
          [K in keyof T & string]: T[K] extends infer El
            ? El extends {
                type: GroupTypes
                schema: infer S
              }
              ? K | Join<K, Paths<S>>
              : El extends {
                    type: ListTypes
                    flat: true
                    schema: infer S
                  }
                ? // List indices use a literal `'0'` (not `${bigint}`) so
                  // suggestions can actually display a concrete path —
                  // template-literal types never appear in IDE completions.
                  // Other indices (`list.3.…`) are still accepted and fully
                  // narrowed: `find` also takes `string & {}` and path
                  // resolution matches any numeric segment.
                  | K
                  | Join<
                      K,
                      Paths<{
                        [I in '0']: SingleSchemaElement<ToObjectSchema<S>>
                      }>
                    >
                : El extends { type: ListTypes; schema: infer S }
                  ? K | Join<K, '0'> | Join<Join<K, '0'>, Paths<S>>
                  : El extends {
                        type: GridTypes
                        grid: infer G extends GridSchemaLike
                      }
                    ? K | Join<K, Paths<GridToSchema<G>>>
                    : // Require `type` so only element entries produce paths —
                      // keys of accidentally wide schema types (e.g. Array
                      // prototype members) must not surface as suggestions.
                      El extends { type: string }
                      ? K
                      : never
            : never
        }[keyof T & string]
```
