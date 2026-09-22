```ts
/**
 * Determines whether an item is available (visible). A string key for direct
 * property lookup, or a function returning a `ConditionalProp` for reactive
 * evaluation. Items whose conditions are not met are omitted from the list.
 */
type ItemConditions = string | ((item: any) => ConditionalProp | undefined)
```
