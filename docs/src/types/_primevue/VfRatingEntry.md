```ts
/**
 * Registry entry for VfRating. `TEntry` is accepted for registry uniformity but
 * does not narrow anything — VfRating has no prop-driven generics.
 */
interface VfRatingEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  VfRatingProps,
  VfRatingEmits,
  VfRatingSlots,
  VfRatingParts,
  VfRatingClasses,
  VfRatingContext
> {}
```
