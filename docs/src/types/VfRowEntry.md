```ts
/**
 * Registry entry for VfRow. `TEntry` is accepted for registry uniformity but
 * does not narrow anything — VfRow has no prop-driven generics.
 */
interface VfRowEntry<TEntry = Record<string, any>> extends DefineRegistryEntry<
  VfRowProps,
  VfRowEmits,
  VfRowSlots,
  VfRowParts,
  VfRowClasses,
  VfRowContext
> {}
```
