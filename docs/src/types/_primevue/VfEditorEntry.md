```ts
/**
 * Registry entry for VfEditor. `TEntry` narrows the props / emits / context by
 * the entry's model-driving props, the same way SFC generics do.
 */
interface VfEditorEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfEditorEmits<EntryTranslateOf<TEntry>, EntryLanguagesOf<TEntry>>,
  VfEditorSlots,
  VfEditorParts,
  VfEditorClasses,
  VfEditorContext<EntryProps<TEntry>>
> {}
```
