```ts
/**
 * Registry entry for VfColorPicker. `TEntry` is accepted for registry
 * uniformity but does not narrow anything — VfColorPicker has no prop-driven
 * generics.
 */
interface VfColorPickerEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  VfColorPickerProps,
  VfColorPickerEmits,
  VfColorPickerSlots,
  VfColorPickerParts,
  VfColorPickerClasses,
  VfColorPickerContext
> {}
```
