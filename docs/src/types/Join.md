```ts
/**
 * Joins two path segments with a dot separator, producing a template literal
 * type.
 */
type Join<K, P> = K extends string | number | bigint
  ? P extends string | number | bigint
    ? `${K}.${P}`
    : never
  : never
```
