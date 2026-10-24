```ts
/**
 * Builds a typed listener registration signature (`on`, `off`) from an event-name-to-argument-tuple map.
 */
type FeatureListener<TEvents extends Record<string, any[]>> =
  UnionToIntersection<
    {
      [K in keyof TEvents & string]: ListenerSignature<K, TEvents[K]>
    }[keyof TEvents & string]
  > &
    ((e: keyof TEvents & string, callback: (...args: any[]) => any) => void)
```
