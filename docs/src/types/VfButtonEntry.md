```ts
/**
 * Registry entry for VfButton. `TEntry` is accepted for registry uniformity but
 * does not narrow anything — VfButton has no prop-driven generics.
 */
interface VfButtonEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  VfButtonProps,
  VfButtonEmits,
  VfButtonSlots,
  VfButtonParts,
  VfButtonClasses,
  VfButtonContext
> {}
```
