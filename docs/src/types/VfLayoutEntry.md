```ts
/**
 * Registry entry for VfLayout. `TEntry` is accepted for registry uniformity but
 * does not narrow anything — VfLayout has no prop-driven generics.
 */
interface VfLayoutEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  VfLayoutProps,
  VfLayoutEmits,
  VfLayoutSlots,
  VfLayoutParts,
  VfLayoutClasses,
  VfLayoutContext
> {}
```
