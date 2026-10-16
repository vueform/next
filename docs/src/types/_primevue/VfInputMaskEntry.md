```ts
/**
 * Registry entry for VfInputMask. `TEntry` narrows the props / emits / context
 * by the entry's model-driving props, the same way SFC generics do.
 */
interface VfInputMaskEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfInputMaskEmits<EntryTranslateOf<TEntry>, EntryLanguagesOf<TEntry>>,
  VfInputMaskSlots,
  VfInputMaskParts,
  VfInputMaskClasses,
  VfInputMaskContext<EntryProps<TEntry>>
> {}
```
