```ts
/**
 * Registry entry for VfCol. `TEntry` is accepted for registry uniformity but
 * does not narrow anything — VfCol has no prop-driven generics.
 */
interface VfColEntry<TEntry = Record<string, any>> extends DefineRegistryEntry<
  VfColProps,
  VfColEmits,
  VfColSlots,
  VfColParts,
  VfColClasses,
  VfColContext
> {}
```
