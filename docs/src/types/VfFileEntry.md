```ts
/**
 * Registry entry for VfFile. `TEntry` narrows the props / emits / context by
 * the entry's model-driving props, the same way SFC generics do.
 */
interface VfFileEntry<TEntry = Record<string, any>> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfFileEmits<EntryMultipleOf<TEntry>>,
  VfFileSlots,
  VfFileParts,
  VfFileClasses,
  VfFileContext<EntryProps<TEntry>>
> {}
```
