```ts
/**
 * Registry entry for VfRadio. `TEntry` narrows the props / emits / context by
 * the entry's model-driving props, the same way SFC generics do.
 */
interface VfRadioEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfRadioEmits<EntryPropOr<TEntry, 'radioValue', true>>,
  VfRadioSlots,
  VfRadioParts,
  VfRadioClasses,
  VfRadioContext<EntryProps<TEntry>>
> {}
```
