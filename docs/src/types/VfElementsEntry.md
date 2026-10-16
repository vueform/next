```ts
/**
 * Registry entry for VfElements. `TEntry` is accepted for registry uniformity
 * but does not narrow anything — VfElements has no prop-driven generics.
 */
interface VfElementsEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  VfElementsProps,
  VfElementsEmits,
  VfElementsSlots,
  VfElementsParts,
  VfElementsClasses,
  VfElementsContext
> {}
```
