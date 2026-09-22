```ts
/**
 * Registry entry for VfInputNumber. `TEntry` is accepted for registry
 * uniformity but does not narrow anything — VfInputNumber has no prop-driven
 * generics.
 */
interface VfInputNumberEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  VfInputNumberProps,
  VfInputNumberEmits,
  VfInputNumberSlots,
  VfInputNumberParts,
  VfInputNumberClasses,
  VfInputNumberContext
> {}
```
