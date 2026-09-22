```ts
/**
 * Registry entry for VfContent. `TEntry` is accepted for registry uniformity
 * but does not narrow anything — VfContent has no prop-driven generics.
 */
interface VfContentEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  VfContentProps,
  VfContentEmits,
  VfContentSlots,
  VfContentParts,
  VfContentClasses,
  VfContentContext
> {}
```
