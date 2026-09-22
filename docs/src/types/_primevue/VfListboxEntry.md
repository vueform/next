```ts
/**
 * Registry entry for VfListbox. `TEntry` narrows the props / emits / context by
 * the entry's option-driving props, the same way SFC generics do.
 */
interface VfListboxEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfListboxEmits<
    EntryOptionsOf<TEntry>,
    EntryOptionValueKeyOf<TEntry>,
    EntryOptionGroupChildrenOf<TEntry>,
    EntryMultipleOf<TEntry>,
    any,
    EntryOptionValueReturnOf<TEntry>
  >,
  VfListboxSlots,
  VfListboxParts,
  VfListboxClasses,
  VfListboxContext<EntryProps<TEntry>>
> {}
```
