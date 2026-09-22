```ts
/**
 * Registry entry for VfSlider. `TEntry` narrows the props / emits / context by
 * the entry's model-driving props, the same way SFC generics do.
 */
interface VfSliderEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfSliderEmits<EntryRangeOf<TEntry>>,
  VfSliderSlots,
  VfSliderParts,
  VfSliderClasses,
  VfSliderContext<EntryProps<TEntry>>
> {}
```
