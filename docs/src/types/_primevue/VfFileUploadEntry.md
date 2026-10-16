```ts
/**
 * Registry entry for VfFileUpload. `TEntry` narrows the props / emits / context
 * by the entry's model-driving props, the same way SFC generics do.
 */
interface VfFileUploadEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfFileUploadEmits<EntryMultipleOf<TEntry>>,
  VfFileUploadSlots,
  VfFileUploadParts,
  VfFileUploadClasses,
  VfFileUploadContext<EntryProps<TEntry>>
> {}
```
