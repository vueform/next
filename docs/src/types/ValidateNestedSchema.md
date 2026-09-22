```ts
/**
 * Recursively validates nested `schema` objects/arrays on group/list entries.
 * Grid cells are not re-validated (parity with the container's runtime
 * resolution).
 */
type ValidateNestedSchema<El> = El extends { schema: infer S }
  ? Omit<El, 'schema'> & {
      schema: S extends readonly any[] | Record<string, any>
        ? { [K in keyof S]: ValidateSchemaEntry<S[K]> }
        : S
    }
  : El
```
