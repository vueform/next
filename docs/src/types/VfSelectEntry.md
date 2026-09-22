```ts
/**
 * Registry entry for VfSelect. `TEntry` narrows the props / emits / context by
 * the entry's item-driving props, the same way SFC generics do.
 */
interface VfSelectEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfSelectEmits<
    EntryItemsOf<TEntry>,
    EntryItemValueKeyOf<TEntry>,
    EntryGroupChildrenOf<TEntry>,
    EntryMultipleOf<TEntry>,
    any,
    EntryItemValueReturnOf<TEntry>
  >,
  VfSelectSlots,
  VfSelectParts,
  VfSelectClasses,
  VfSelectContext<EntryProps<TEntry>>
> {}
```
