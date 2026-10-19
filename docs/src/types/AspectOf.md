```ts
/**
 * One aspect surface's member for a part key, normalized for aggregation:
 * the empty bag when the surface has no member for the key, non-nullable
 * otherwise (optional members stay callable/spreadable).
 */
type AspectOf<T, K> = K extends keyof T ? NonNullable<T[K]> : {}
```
