```ts
/**
 * Registry entry for VfToggleButton. `TEntry` is accepted for registry
 * uniformity but does not narrow anything — VfToggleButton has no prop-driven
 * generics.
 */
interface VfToggleButtonEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  VfToggleButtonProps,
  VfToggleButtonEmits,
  VfToggleButtonSlots,
  VfToggleButtonParts,
  VfToggleButtonClasses,
  VfToggleButtonContext
> {}
```
