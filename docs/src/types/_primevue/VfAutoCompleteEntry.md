```ts
/**
 * Registry entry for VfAutoComplete. `TEntry` narrows the props / emits /
 * context by the entry's suggestion-driving props, the same way SFC generics
 * do.
 */
interface VfAutoCompleteEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfAutoCompleteEmits<EntrySuggestionsOf<TEntry>, EntryMultipleOf<TEntry>>,
  VfAutoCompleteSlots,
  VfAutoCompleteParts,
  VfAutoCompleteClasses,
  VfAutoCompleteContext<EntryProps<TEntry>>
> {}
```
