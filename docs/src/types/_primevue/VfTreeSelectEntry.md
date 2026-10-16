```ts
/**
 * Registry entry for VfTreeSelect. `TEntry` narrows the props / emits / context
 * by the entry's tree-driving props, the same way SFC generics do.
 */
interface VfTreeSelectEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfTreeSelectEmits<EntryTreeOptionsOf<TEntry>, EntrySelectionModeOf<TEntry>>,
  VfTreeSelectSlots,
  VfTreeSelectParts,
  VfTreeSelectClasses,
  VfTreeSelectContext<EntryProps<TEntry>>
> {}
```
