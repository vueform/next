```ts
/**
 * Converts a grid cell definition to its object-schema representation (named
 * element cells keyed by their `name`).
 */
type GridToSchema<T> = {
  [K in Extract<FlattenDeep<T>, { name: ElementName }> as K['name']]: K
}
```
