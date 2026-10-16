```ts
/**
 * Builds a typed `fire` signature from an event-name-to-argument-tuple map.
 */
type FeatureFire<TEvents extends Record<string, any[]>> = UnionToIntersection<
  {
    [K in keyof TEvents & string]: FireSignature<K, TEvents[K]>
  }[keyof TEvents & string]
> &
  ((e: keyof TEvents & string, ...args: any[]) => any)
```
