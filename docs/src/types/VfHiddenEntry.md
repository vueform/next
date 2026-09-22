```ts
/**
 * Registry entry for VfHidden. `TEntry` is accepted for registry uniformity but
 * does not narrow anything — VfHidden has no prop-driven generics.
 */
interface VfHiddenEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  VfHiddenProps,
  VfHiddenEmits,
  VfHiddenSlots,
  VfHiddenParts,
  VfHiddenClasses,
  VfHiddenContext
> {}
```
