```ts
/**
 * Registry entry for VfRadioButton. `TEntry` narrows the props / emits /
 * context by the entry's model-driving props, the same way SFC generics do.
 */
interface VfRadioButtonEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfRadioButtonEmits<EntryPropOr<TEntry, 'value', true>>,
  VfRadioButtonSlots,
  VfRadioButtonParts,
  VfRadioButtonClasses,
  VfRadioButtonContext<EntryProps<TEntry>>
> {}
```
