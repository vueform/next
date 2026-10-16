```ts
/**
 * Extracts the schema entry of a single-element schema (used for `flat` lists).
 */
type SingleSchemaElement<S> = [S] extends [ArraySchemaType]
  ? S extends readonly [infer E]
    ? E
    : never
  : string extends keyof S
    ? never
    : [IsSingleKey<S>] extends [true]
      ? S[keyof S & string]
      : never
```
