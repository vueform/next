```ts
/**
 * Registry entry for VfField. `TEntry` narrows the props / emits / context by
 * the entry's model-driving props, the same way SFC generics do.
 */
interface VfFieldEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfFieldEmits<
    EntryTranslateOf<TEntry>,
    EntryLanguagesOf<TEntry>,
    EntryNullValueOf<TEntry>
  >,
  VfFieldSlots,
  VfFieldParts,
  VfFieldClasses,
  VfFieldContext<EntryProps<TEntry>>
> {}
```
