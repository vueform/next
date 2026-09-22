```ts
/**
 * Registry entry for VfNav. `TEntry` is accepted for registry uniformity but
 * does not narrow anything — VfNav has no prop-driven generics.
 */
interface VfNavEntry<TEntry = Record<string, any>> extends DefineRegistryEntry<
  VfNavProps,
  VfNavEmits,
  VfNavSlots,
  VfNavParts,
  VfNavClasses,
  VfNavContext
> {}
```
