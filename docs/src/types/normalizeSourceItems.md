```ts
/**
 * Normalizes a raw cols/rows source (array of primitives, array of objects, or
 * plain object map) into `{ value, label, $raw }` entries. Primitives and
 * object map entries produce synthetic raw objects and ignore the key/label
 * resolvers.
 *
 * @param source The resolved raw cols/rows data.
 * @param key The string key or mapping function resolving each item's value.
 * @param label The string key or mapping function resolving each item's label.
 */
function normalizeSourceItems(
  source: any[] | Record<string, any>,
  key: string | ((item: any) => any) | null | undefined,
  label: string | ((item: any) => any)
): { value: any; label: any; $raw: Record<string, any> }[]
```
