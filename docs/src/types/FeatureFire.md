```ts
/**
 * Builds a `fire` signature from an event-name-to-argument-tuple map. Combines
 * per-event overloads (for typed arguments and autocomplete) with a union-name
 * guard signature so that a factory declaring an event name absent from the
 * blueprint's events is caught at compile time.
 */
type FeatureFire<TEvents extends Record<string, any[]>> = UnionToIntersection<
  {
    [K in keyof TEvents & string]: (e: K, ...args: TEvents[K]) => any
  }[keyof TEvents & string]
> &
  ((e: keyof TEvents & string, ...args: any[]) => any)
```
