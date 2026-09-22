```ts
/**
 * Registry entry for VfText. `TEntry` narrows the props / emits / context by
 * the entry's model-driving props, the same way SFC generics do.
 */
interface VfTextEntry<TEntry = Record<string, any>> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfTextEmits<EntryTranslateOf<TEntry>, EntryLanguagesOf<TEntry>>,
  VfTextSlots,
  VfTextParts,
  VfTextClasses,
  VfTextContext<EntryProps<TEntry>>
> {}
```
