```ts
/**
 * Collects the bag attribute names outside the aspect's allowed vocabulary
 * across all members of a surface.
 */
type InvalidBagKeys<T, TAllowed extends PropertyKey> = {
  [K in keyof T]: Exclude<keyof ResolvedSurfaceMember<T[K]>, TAllowed>
}[keyof T]
```
