```ts
/**
 * Registry entry for VfAddon. `TEntry` is accepted for registry uniformity but
 * does not narrow anything — VfAddon has no prop-driven generics.
 */
interface VfAddonEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  VfAddonProps,
  VfAddonEmits,
  VfAddonSlots,
  VfAddonParts,
  VfAddonClasses,
  VfAddonContext
> {}
```
