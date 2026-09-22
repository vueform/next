```ts
/**
 * Registry entry for VfDatePicker. `TEntry` narrows the props / emits / context
 * by the entry's model-driving props, the same way SFC generics do.
 */
interface VfDatePickerEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfDatePickerEmits<EntrySelectionModeOf<TEntry>>,
  VfDatePickerSlots,
  VfDatePickerParts,
  VfDatePickerClasses,
  VfDatePickerContext<EntryProps<TEntry>>
> {}
```
