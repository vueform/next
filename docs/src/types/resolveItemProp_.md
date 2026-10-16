```ts
/**
 * Resolves a property from a raw item using a string key lookup or a mapping
 * function.
 *
 * @param raw The raw item object.
 * @param resolver The string key or mapping function.
 */
function resolveItemProp(
  raw: Record<string, any>,
  resolver: string | ((item: any) => any)
): any
```
