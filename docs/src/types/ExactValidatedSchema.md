```ts
/**
 * Maps a schema (object or array) through `ValidateSchemaEntry`, replacing each
 * entry with the expected type when validation fails so TypeScript surfaces
 * property-level errors (e.g. wrong `modelValue` or `itemValue`).
 */
type ExactValidatedSchema<O> = {
  [K in keyof O]: O[K] extends ValidateSchemaEntry<O[K]>
    ? O[K]
    : ValidateSchemaEntry<O[K]>
}
```
