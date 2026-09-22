```ts
/**
 * Builds a listener registration signature (`on`, `off`, `onBefore`, `onAfter`)
 * from an event-name-to-argument-tuple map. Like `FeatureFire`, it combines
 * per-event overloads with a union-name guard so that a factory referencing an
 * event absent from the blueprint's events is caught at compile time.
 */
type FeatureListener<TEvents extends Record<string, any[]>> =
  UnionToIntersection<
    {
      [K in keyof TEvents & string]: (
        e: K,
        callback: (...args: TEvents[K]) => any
      ) => void
    }[keyof TEvents & string]
  > &
    ((e: keyof TEvents & string, callback: (...args: any[]) => any) => void)
```
