```ts
/**
 * Registry entry for VfPassword. `TEntry` narrows the props / emits / context
 * by the entry's model-driving props, the same way SFC generics do.
 */
interface VfPasswordEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfPasswordEmits<EntryTranslateOf<TEntry>, EntryLanguagesOf<TEntry>>,
  VfPasswordSlots,
  VfPasswordParts,
  VfPasswordClasses,
  VfPasswordContext<EntryProps<TEntry>>
> {}
```
