```ts
/**
 * Determines whether an item is disabled. A string key for direct property
 * lookup, or a function returning a `ConditionalProp` for reactive evaluation.
 */
type ItemDisabled = string | ((item: any) => ConditionalProp | undefined)
```
