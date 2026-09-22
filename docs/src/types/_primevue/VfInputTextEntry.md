```ts
/**
 * Registry entry for VfInputText. `TEntry` narrows the props / emits / context
 * by the entry's model-driving props, the same way SFC generics do.
 */
interface VfInputTextEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfInputTextEmits<EntryTranslateOf<TEntry>, EntryLanguagesOf<TEntry>>,
  VfInputTextSlots,
  VfInputTextParts,
  VfInputTextClasses,
  VfInputTextContext<EntryProps<TEntry>>
> {}
```
