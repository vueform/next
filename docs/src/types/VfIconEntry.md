```ts
/**
 * Registry entry for VfIcon. `TEntry` is accepted for registry uniformity but
 * does not narrow anything — VfIcon has no prop-driven generics.
 */
interface VfIconEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  VfIconProps,
  VfIconEmits,
  VfIconSlots,
  VfIconParts,
  VfIconClasses,
  VfIconContext
> {}
```
