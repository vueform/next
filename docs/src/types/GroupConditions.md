```ts
/**
 * Determines whether a group is available. A string key for direct property
 * lookup, or a function returning a `ConditionalProp`. Groups whose conditions
 * are not met are omitted entirely.
 */
type GroupConditions = string | ((group: any) => ConditionalProp | undefined)
```
