```ts
/**
 * Registry entry for VfTextarea. `TEntry` narrows the props / emits / context
 * by the entry's model-driving props, the same way SFC generics do.
 */
interface VfTextareaEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfTextareaEmits<EntryTranslateOf<TEntry>, EntryLanguagesOf<TEntry>>,
  VfTextareaSlots,
  VfTextareaParts,
  VfTextareaClasses,
  VfTextareaContext<EntryProps<TEntry>>
> {}
```
